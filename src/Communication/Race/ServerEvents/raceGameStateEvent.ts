import ItemState from "../../../GameCore/items/itemState";
import PlayerState from "../../../GameCore/playerState";
import RaceGameState from "../../../GameCore/Race/RaceGameState";
import SocketEvent from "../../SocketEvent";

export default class RaceGameStateEvent implements SocketEvent {
	private static readonly _Name: string = "GameStateEvent";
	private _data: RaceGameState;

	constructor(raceGameState: RaceGameState = { players: [], items: [] }) {
		this._data = raceGameState;
	}

	get Name(): string {
		return (this.constructor as typeof RaceGameStateEvent)._Name;
	}

	get data(): RaceGameState {
		return this._data;
	}

	get players(): PlayerState[] {
		return this._data.players;
	}

	get items(): ItemState[] {
		return this._data.items;
	}

	set data(raceGameState: RaceGameState) {
		this._data = raceGameState;
	}
}
