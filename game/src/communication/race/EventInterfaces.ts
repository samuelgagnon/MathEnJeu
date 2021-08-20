import { ItemType } from "../../gameCore/race/items/Item";
import { GameOptions } from "./../room/EventInterfaces";
import { AnswerDTO } from "./AnswerDTO";
import { PlayerDTO } from "./PlayerDTO";
import { QuestionDTO } from "./QuestionDTO";
import { StartingRaceGridInfo } from "./StartingGridInfo";

//This file contains interfaces to type events that happen between the client and the server for RaceGame.

//Event interfaces sent from client to server
export interface UseItemEvent {
	itemType: ItemType;
	targetPlayerId: string;
	fromPlayerId?: string;
}

export interface MoveRequestEvent {
	playerId: string;
	targetLocation: Point;
}

export interface UseBookEvent {
	playerId: string;
}

export interface AnswerQuestionEvent {
	playerId: string;
	clientTimestamp: number;
	answerTimestamp: number;
	targetLocation: Point;
	answer: AnswerDTO;
}

//Event interfaces sent from server to client(s)
export interface GameCreatedEvent {
	gameTime: number;
	gameStartTimeStamp: number;
	grid: StartingRaceGridInfo;
	players: PlayerDTO[];
	isSinglePlayer: boolean;
}

export interface PlayerLeftEvent {
	playerId: string;
}

export interface GameEndEvent {
	players: PlayerDTO[];
}

//Maybe rework targetlocation to put it somewhere else ?
export interface QuestionFoundEvent {
	targetLocation: Point;
	questionDTO: QuestionDTO;
}

export interface QuestionFoundFromBookEvent {
	questionDTO: QuestionDTO;
}

export interface QuestionAnsweredEvent {
	playerId: string;
	answerIsRight: boolean;
	correctionTimestamp: number;
	targetLocation: Point;
}

export interface LapCompletedEvent {
	playerId: string;
}

export interface ItemUsedEvent {
	itemType: ItemType;
	targetPlayerId: string;
	fromPlayerId?: string;
}

export interface InitializeGameEvent {
	gameOptions: GameOptions;
	playerId: string;
}

export interface GameInitializedEvent {
	preGameToInGameTransitionTimestamp: number;
}

export interface CancelGameInitializationEvent {
	playerId: string;
}
