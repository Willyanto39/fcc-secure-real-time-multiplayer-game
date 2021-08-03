import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { dimension } from './dimension.mjs';
import { generatePosition } from './utils.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const BG_COLOR = '#231f20';
const TEXT_COLOR = '#ffffff';
const STROKE_COLOR = TEXT_COLOR;
const FONT = `12px 'Press Start 2P'`;

// credit to freeCodeCamp for the images
const FCC_CDN_IMAGE_BASE_URL = 'https://cdn.freecodecamp.org/demo-projects/images';
const mainPlayerImage = loadImage(`${FCC_CDN_IMAGE_BASE_URL}/main-player.png`);
const otherPlayerImage = loadImage(`${FCC_CDN_IMAGE_BASE_URL}/other-player.png`);
const bronzeCoinImage = loadImage(`${FCC_CDN_IMAGE_BASE_URL}/bronze-coin.png`);
const silverCoinImage = loadImage(`${FCC_CDN_IMAGE_BASE_URL}/silver-coin.png`);
const goldCoinImage = loadImage(`${FCC_CDN_IMAGE_BASE_URL}/gold-coin.png`);

let opponents = [];
let coin;
let player;
let gameOverResult;

socket.on('connect', () => {
  player = new Player({
    id: socket.id,
    x: generatePosition(dimension.MIN_PLAYER_X, dimension.MAX_PLAYER_X),
    y: generatePosition(dimension.MIN_PLAYER_Y, dimension.MAX_PLAYER_Y),
    score: 0
  });

  socket.emit('player-joined', player);

  socket.on('current-opponents', currOpponents => {
    opponents = currOpponents;
  });

  socket.on('new-player', newPlayer => {
    opponents.push(newPlayer);
  });

  socket.on('coin-generated', generatedCoin => {
    coin = new Collectible(generatedCoin);
  });

  document.onkeydown = e => {
    let dir = getDir(e);

    if (dir) {
      player.movePlayer(dir, 10);
      socket.emit('player-moved', player);

      if (player.collision(coin)) {
        socket.emit('coin-collected', { player, coin });
      }
    }
  };

  socket.on('player-moved', movingPlayer => {
    const { id, x, y } = movingPlayer;
    const playerToUpdate = opponents.find(player => player.id === id);
    playerToUpdate.x = x;
    playerToUpdate.y = y;
  });

  socket.on('player-left', id => {
    opponents = opponents.filter(player => player.id !== id);
  });

  socket.on('score-updated', score => {
    player.score = score;
  });

  socket.on('coin-collected', playerData => {
    const collectingPlayer = opponents.filter(opponent => opponent.id === playerData.id)[0];
    collectingPlayer.score = playerData.score;
  });

  socket.on('game-over', winnerId => {
    if (player.id === winnerId) {
      gameOverResult = 'win';
    } else {
      gameOverResult = 'lose';
    }
  });

  draw();
});

function draw() {
  context.fillStyle = BG_COLOR;
  context.fillRect(0, 0, dimension.CANVAS_WIDTH, dimension.CANVAS_HEIGHT);

  context.fillStyle = TEXT_COLOR;
  context.font = FONT;
  context.textAlign = 'center';
  context.fillText('Coin Race', dimension.CANVAS_WIDTH / 2, 40);

  context.fillStyle = TEXT_COLOR;
  context.font = FONT;
  context.textAlign = 'center';
  context.fillText('Controls: WASD', 100, 40);

  context.strokeStyle = STROKE_COLOR;
  context.strokeRect(
    dimension.MIN_PLAY_FIELD_X,
    dimension.MIN_PLAY_FIELD_Y,
    dimension.PLAY_FIELD_WIDTH,
    dimension.PLAY_FIELD_HEIGHT
  );

  const players = [player, ...opponents];

  if (player) {
    context.fillStyle = TEXT_COLOR;
    context.font = FONT;
    context.textAlign = 'center';
    context.fillText(player.calculateRank(players), 560, 40);

    drawPlayers(players);
  }

  if (coin) {
    drawCoin();
  }

  if (gameOverResult) {
    document.onkeydown = null;

    context.fillStyle = TEXT_COLOR;
    context.font = FONT;
    context.textAlign = 'center';
    context.fillText(
      `You ${gameOverResult}! Restart and try again`,
      dimension.CANVAS_WIDTH / 2,
      dimension.CANVAS_HEIGHT / 2
    );
  } else {
    requestAnimationFrame(draw);
  }
}

function drawPlayers(players) {
  const { id } = player;

  players.map(player => {
    const { x, y, width, height } = player;
    let playerImage;

    if (player.id === id) {
      playerImage = mainPlayerImage;
    } else {
      playerImage = otherPlayerImage;
    }

    context.drawImage(playerImage, x, y, width, height);
  });
}

function drawCoin() {
  const { x, y, width, height, value } = coin;
  let coinImage;

  switch(value) {
    case 1:
      coinImage = bronzeCoinImage;
      break;
    case 2:
      coinImage = silverCoinImage;
      break;
    case 5:
      coinImage = goldCoinImage;
      break;
  }

  context.drawImage(coinImage, x, y, width, height);
}

function loadImage(src) {
  const image = new Image();
  image.src = src;

  return image;
}

function getDir(e) {
  const key = e.key;
  let dir;

  switch(key) {
    case 'w':
    case 'W':
      dir = 'up';
      break;
    case 'a':
    case 'A':
      dir = 'left';
      break;
    case 's':
    case 'S':
      dir = 'down'
      break;
    case 'd':
    case 'D':
      dir = 'right';
      break;
  }

  return dir;
}
