import Character from "../../gameCore/race/character/Character";
import PlayerState from "./PlayerState";

export interface PlayerDTO {
	name: string;
	character: Character;
	state: PlayerState;
}
