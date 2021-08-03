import { dimension } from "./dimension.mjs";

class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.width = dimension.PLAYER_WIDTH;
    this.height = dimension.PLAYER_HEIGHT;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up':
        this.y = Math.max(dimension.MIN_PLAYER_Y, this.y - speed);
        break;
      case 'down':
        this.y = Math.min(dimension.MAX_PLAYER_Y, this.y + speed);
        break;
      case 'left':
        this.x = Math.max(dimension.MIN_PLAYER_X, this.x - speed);
        break;
      case 'right':
        this.x = Math.min(dimension.MAX_PLAYER_X, this.x + speed);
        break;
    }
  }

  collision(item) {
    if (this.x < item.x + item.width &&
      this.x + this.width > item.x &&
      this.y < item.y + item.height &&
      this.y + this.height > item.y) {
      return true;
    }

    return false;
  }

  calculateRank(arr) {
    let position;

    // prevent new player from showing rank 1 due to incomplete players data
    if (this.score === 0) {
      position = arr.length;
    } else {
      position = 1 + arr
        .sort((a, b) => {
          return b.score - a.score;
        }).findIndex(player => {
          return player.id === this.id;
        });
    }

    return `Rank: ${position} / ${arr.length}`;
  }
}

export default Player;
