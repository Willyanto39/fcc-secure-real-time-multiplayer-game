require('dotenv').config();
const express = require('express');
const cors = require('cors');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

// Index page (static HTML)
app.route('/')
.get((req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404)
  .type('text')
  .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV ==='test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const io = socket(server);
const Collectible = require('./public/Collectible');
const { dimension } = require('./public/dimension');
const { generatePosition } = require('./public/utils');

const MAX_SCORE = 100;

const generateCoin = () => {
  const values = [1, 2, 5];
  const index = Math.floor(Math.random() * (values.length));
  const value = values[index];

  return new Collectible({
    x: generatePosition(dimension.MIN_COIN_X, dimension.MAX_COIN_X),
    y: generatePosition(dimension.MIN_COIN_Y, dimension.MAX_COIN_Y),
    value,
    id: Date.now()
  });
};

const getInitalState = () => {
  return {
    currentPlayers: [],
    coin: generateCoin()
  };
}

const getOpponents = (id, players) => {
  return players.filter(player => player.id !== id);
}

let state = getInitalState();

io.sockets.on('connection', socket => {
  console.log(`new socket id: ${socket.id}`);

  socket.on('player-joined', player => {
    state.currentPlayers.push(player);
    socket.emit('coin-generated', state.coin);
    const opponents = getOpponents(socket.id, state.currentPlayers);
    socket.emit('current-opponents', opponents);

    socket.broadcast.emit('new-player', player);
  });

  socket.on('player-moved', player => {
    const { id } = player;
    const movingPlayer = state.currentPlayers.filter(player => player.id === id)[0];
    movingPlayer.x = player.x;
    movingPlayer.y = player.y;

    socket.broadcast.emit('player-moved', movingPlayer);
  });

  socket.on('coin-collected', ({ player, coin }) => {
    const { value } = coin;
    player.score += value;

    if (player.score >= MAX_SCORE) {
      io.sockets.emit('game-over', player.id);
      state = getInitalState();
      return;
    }

    socket.emit('score-updated', player.score);

    state.coin = generateCoin();
    socket.broadcast.emit('coin-collected', player);
    io.sockets.emit('coin-generated', state.coin);
  });

  socket.on('disconnect', () => {
    console.log('disconnected socket id: ', socket.id);
    state.currentPlayers = state.currentPlayers.filter(player => player.id !== socket.id);

    socket.broadcast.emit('player-left', socket.id);
  });
});

module.exports = app; // For testing
