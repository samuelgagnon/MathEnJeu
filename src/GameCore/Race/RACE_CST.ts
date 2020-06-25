import { GAMECORE_CST } from "../GAMECORE_CST";

export const RACE_CST = {
	MOVE: {
		SPEED: 0.003, //in tile per millisecond.
		NORM: GAMECORE_CST.Norm.Taxicab,
	},
	MARATHON: {
		GAME_MAX_LENGTH: 45 * 60 * 1000, //in milliseconds
		GRID_WIDTH: 24,
		GRID_HEIGTH: 28,
	},
};
