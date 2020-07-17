import ItemState from "./ItemState";
import PlayerState from "./PlayerState";

export default interface RaceGameState {
	players: PlayerState[];
	itemsState: ItemState[];
	remainingTime: number;
	//Data concerning the game remaining time?
}
