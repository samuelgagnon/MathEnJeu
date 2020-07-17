import ItemState from "./itemState";
import PlayerState from "./playerState";

export default interface RaceGameState {
	players: PlayerState[];
	itemsState: ItemState[];
	remainingTime: number;
	//Data concerning the game remaining time?
}
