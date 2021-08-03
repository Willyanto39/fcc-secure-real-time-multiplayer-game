const canvasWidth = 640;
const canvasHeight = 480;
const gap = 5;
const infoBarHeight = 60;
const playerWidth = 30;
const playerHeight = 30;
const coinWidth = 15;
const coinHeight = 15;

const dimension = {
  CANVAS_WIDTH: canvasWidth,
  CANVAS_HEIGHT: canvasHeight,
  PLAYER_WIDTH: playerWidth,
  PLAYER_HEIGHT: playerHeight,
  COIN_WIDTH: coinWidth,
  COIN_HEIGHT: coinHeight,
  PLAY_FIELD_WIDTH: canvasWidth - 2 * gap,
  PLAY_FIELD_HEIGHT: canvasHeight - infoBarHeight - 2 * gap,
  MIN_PLAY_FIELD_X: gap,
  MIN_PLAY_FIELD_Y: infoBarHeight + gap,
  MIN_PLAYER_X: gap,
  MAX_PLAYER_X: canvasWidth - playerWidth - gap,
  MIN_PLAYER_Y: infoBarHeight + gap,
  MAX_PLAYER_Y: canvasHeight - playerHeight - gap,
  MIN_COIN_X: gap,
  MAX_COIN_X: canvasWidth - coinWidth - gap,
  MIN_COIN_Y: infoBarHeight + gap,
  MAX_COIN_Y: canvasHeight - coinHeight - gap,
};

export { dimension };
