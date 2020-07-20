import ItemState from "../items/itemState";
import PlayerState from "../playerState";

export default interface RaceGameState {
	players: PlayerState[];
	items: ItemState[];
	//Data concerning the game remaining time?
}