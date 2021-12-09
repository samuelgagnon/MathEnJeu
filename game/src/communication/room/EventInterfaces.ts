import CharacterDTO from "../race/CharacterDTO";
import { UserDTO } from "../user/UserDTO";

export interface RoomSettings {
	maxPlayerCount: number;
	isPrivate: boolean;
	createTime: number;
	type: string;
}

export interface RoomInfoEvent {
	roomId: string;
	userDTOs: UserDTO[];
	hostName: string;
}

export interface JoinRoomAnswerEvent {
	roomId: string;
	isCreateRoom: string;
	error: Error;
}

export interface JoinRoomRequestEvent {
	roomId: string;
}

export interface HostChangeEvent {
	newHostName: string;
}

//this includes the games options selected by the host
export interface GameOptions {
	gameTime: number;
	computerPlayerCount: number;
}

export interface InitializeGameEvent {
	gameOptions: GameOptions;
	playerId: string;
}

export interface GameInitializedEvent {
	preGameToInGameTimestamp: number;
}

export interface CancelGameInitializationEvent {
	playerId: string;
}

export interface ReadyEvent {
	characterDTO: CharacterDTO;
}
