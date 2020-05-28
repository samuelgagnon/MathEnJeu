const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const config = {
	type: Phaser.AUTO,
	backgroundColor: "#000000",
	scale: {
		parent: "phaser-game",
		mode: Phaser.Scale.NONE,
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
	},
	scene: [],
};
export default config;
