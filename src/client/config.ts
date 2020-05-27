const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

// the size of the world
export const world = {
  x: 0,
  y: 0,
  width: 2560,
  height: 864,
};

const config = {
  type: Phaser.WEBGL,
  backgroundColor: "#000000",
  scale: {
    parent: "phaser-game",
    mode: Phaser.Scale.NONE,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [],
  physics: {
    default: "matter",
    matter: {
      gravity: {
        y: 0.8,
      },
      debug: false,
      debugBodyColor: 0xff00ff,
    },
  },
};
export default config;
