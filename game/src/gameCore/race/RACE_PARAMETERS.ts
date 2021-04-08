export const RACE_PARAMETERS = {
	MOVE: {
		SPEED: 0.001, //in tile per millisecond.
	},
	CIRCUIT: {
		STARTING_TRANSITION_DURATION: 4 * 1000, //in milliseconds
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
		POINTS_CALCULATOR: (moveDistance: number): number => {
			let points = 0;
			switch (moveDistance) {
				case 1:
					points = 2;
					break;
				case 2:
					points = 3;
					break;
				case 3:
					points = 5;
					break;
				case 4:
					points = 8;
					break;
				case 5:
					points = 13;
					break;
				case 6:
					points = 21;
					break;
				case 7:
					points = 34;
					break;
			}
			return points;
		},
	},
	QUESTION: {
		MIN_DIFFICULTY: 1,
		MAX_DIFFICULTY: 6,
	},
};
