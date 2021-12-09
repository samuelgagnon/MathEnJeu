export const RACE_PARAMETERS = {
	MOVE: {
		SPEED: 0.0014, //in tile per millisecond.
	},
	CIRCUIT: {
		STARTING_TRANSITION_DURATION: 3 * 100, //in milliseconds
		NUMBER_OF_CHECKPOINTS: 8,
		POINTS_FOR_LAP: 50,
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

export const RACE_PARAMETERS_10 = {
	CIRCUIT: {
		GRID_WIDTH: 17,
		GRID_HEIGTH: 19,
		NUMBER_OF_ITEMS: 10,
		GRID:
			"....6wxxxxxxxxxxx" +
			"....6w.wxxxxxxxxx" +
			"....6w.w7...xxxxx" +
			"...xxw.w7...xxxxx" +
			"...xxxxw7...xxxxx" +
			"...xxxxxx...xxxxx" +
			"555xxxxxx........" +
			"wwwwxxxxx........" +
			"x...xxxxx........" +
			"xwwwwxxxxxxxxx..." +
			"xx444xxxxxxxxx..." +
			"xx......xxxxxx888" +
			"xx......xxxxxx|||" +
			"xx......xxxxxx..." +
			"xx.....3wxxxxx..." +
			"xxxx...3w.wxxx111" +
			"xxxx...3w.w2....." +
			"xxxxxxxxw.w2....." +
			"xxxxxxxxxxw2.....",
	},
};

export const RACE_PARAMETERS_20 = {
	CIRCUIT: {
		GRID_WIDTH: 28,
		GRID_HEIGTH: 29,
		NUMBER_OF_ITEMS: 20,
		GRID:
			"xxxxxxxxx....6wxxxxxxxxxxxxx" +
			"xxxxxxxxx....6w.wxxxxxxxxxxx" +
			".............6w.w7.....xxxxx" +
			"............xxw.w7.....xxxxx" +
			"............xxxxw7.....xxxxx" +
			"............xxxxxxx....xxxxx" +
			"....xxxxxxxxxxxxxxx....xxxxx" +
			"....xxxxxxxxxxxxxxx....xxxxx" +
			"....xxxxxxxxxxxxxxx....xxxxx" +
			"....xxxxxxxxxxxxxxx....xxxxx" +
			"555xxxxxxxxxxxxxxxx....xxxxx" +
			"wwwwxxxxxxxxxxxxxxx........." +
			"x...xxxxxxxxxxxxxxx........." +
			"xwwwwxxxxxxxxxxxxxx........." +
			"xx444xxxxxxxxxxxxxxxxxxx...." +
			"xx.......xxxxxxxxxxxxxxx...." +
			"xx.......xxxxxxxxxxxxxxx8888" +
			"xx.......xxxxxxxxxxxxxxx||||" +
			"xxxxx....xxxxxxxxxxxxxxx...." +
			"xxxxx....xxxxxxxxxxxxxxx1111" +
			"xxxxx....xxxxxxxxxx........." +
			"xxxxx..........xxxx........." +
			"xxxxx..........xxxx........." +
			"xxxxx..........xxxx....xxxxx" +
			"xxxxxxxxxxx...3wxxx....xxxxx" +
			"xxxxxxxxxxx...3w.wx....xxxxx" +
			"xxxxxxxxxxx...3w.w2....xxxxx" +
			"xxxxxxxxxxxxxxxw.w2....xxxxx" +
			"xxxxxxxxxxxxxxxxxw2....xxxxx",
	},
};

export const RACE_PARAMETERS_30 = {
	CIRCUIT: {
		GRID_WIDTH: 39,
		GRID_HEIGTH: 38,
		NUMBER_OF_ITEMS: 30,
		GRID:
			"xxxxxxxxxxxxxxx...6wxxxxxxxxxxxxxxxxxxx" +
			"xxxxxxxxxxxxxxx...6w.wxxxxxxxxxxxxxxxxx" +
			"xxxxxxxxxxxxxxx...6w.w7.......xxxxxxxxx" +
			"xxxxxxxxxxxxxxx...xw.w7.......xxxxxxxxx" +
			"xxxx..............xxxw7.......xxxxxxxxx" +
			"xxxx..............xxxxxxxx....xxxxxxxxx" +
			"xxxx..............xxxxxxxx....xxxxxxxxx" +
			"xxxx..............xxxxxxxx....xxxxxxxxx" +
			"xxxx....xxxxxxxxxxxxxxxxxx....xxxxxxxxx" +
			"xxxx....xxxxxxxxxxxxxxxxxx....xxxxxxxxx" +
			"xxxx....xxxxxxxxxxxxxxxxxx....xxxxxxxxx" +
			"xxxx....xxxxxxxxxxxxxxxxxx....xxxxxxxxx" +
			"xxxx....xxxxxxxxxxxxxxxxxx....xxxxxxxxx" +
			"........xxxxxxxxxxxxxxxxxx............." +
			"........xxxxxxxxxxxxxxxxxx............." +
			"........xxxxxxxxxxxxxxxxxx............." +
			"...xxxxxxxxxxxxxxxxxxxxxxx............." +
			"555xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...." +
			"wwwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...." +
			"x...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...." +
			"xwwwwxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...." +
			"xx444xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx8888" +
			"xx...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx||||" +
			"xx...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...." +
			"xx............xxxxxxxxxxxxxxxxxxxxx...." +
			"xx............xxxxxxxxxxxxxxxxxxxxx1111" +
			"xx............xxxxxxxx................." +
			"xx............xxxxxxxx................." +
			"xxxxxxxxxx....xxxxxxxx................." +
			"xxxxxxxxxx....xxxxxxxx................." +
			"xxxxxxxxxx....xxxxxxxx....xxxxxxxxxxxxx" +
			"xxxxxxxxxx....xxxxxxxx....xxxxxxxxxxxxx" +
			"xxxxxxxxxx....xxxxxxxx....xxxxxxxxxxxxx" +
			"xxxxxxxxxx.....3wxxxxx....xxxxxxxxxxxxx" +
			"xxxxxxxxxx.....3w.wxxx....xxxxxxxxxxxxx" +
			"xxxxxxxxxx.....3w.w2......xxxxxxxxxxxxx" +
			"xxxxxxxxxxxxxxxxw.w2......xxxxxxxxxxxxx" +
			"xxxxxxxxxxxxxxxxxxw2......xxxxxxxxxxxxx",
	},
};
