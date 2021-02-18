export const RACE_CST = {
	MOVE: {
		SPEED: 0.001, //in tile per millisecond.
	},
	CIRCUIT: {
		GAME_MAX_LENGTH: 5 * 60 * 1000, //in milliseconds
		GRID_WIDTH: 20,
		GRID_HEIGTH: 16,
		NUMBER_OF_CHECKPOINTS: 5,
		POINTS_FOR_LAP: 50,
		GRID:
			"xx.......3........xx" +
			"x........3.........x" +
			".........3.........." +
			".........3.........." +
			".........3.........." +
			".........3.........." +
			".......xxxxxx......." +
			"444444xxxxxxxx222222" +
			"......xxxxxxxx......" +
			"......5xxxxxx1......" +
			"......5|.....1......" +
			"......5.|....1......" +
			"......5..|...1......" +
			"......5...|..1......" +
			"x.....5....|.1.....x" +
			"xx....5.....|1....xx",
		NUMBER_OF_ITEMS: 60,
	},
	QUESTION: {
		MIN_DIFFICULTY: 1,
		MAX_DIFFICULTY: 6,
	},
};
