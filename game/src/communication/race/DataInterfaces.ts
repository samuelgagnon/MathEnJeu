import { ItemType } from "../../gameCore/race/items/Item";
import UserInfo from "../userInfo";
import ItemState from "./ItemState";
import PlayerState from "./PlayerState";

export interface ItemUsedEvent {
	itemType: ItemType;
	targetPlayerId: string;
	fromPlayerId?: string;
}

export interface MoveRequestEvent {
	playerId: string;
	targetLocation: Point;
}

export interface BookUsedEvent {
	playerId: string;
	targetLocation: Point;
	questionDifficulty: number;
}

export interface GameStartEvent {
	gameTime: number;
	gameStartTimeStamp: number;
	grid: StartingRaceGridInfo;
	players: PlayerState[];
	isSinglePlayer: boolean;
}

//this includes the games options selected by the host
export interface GameOptions {
	gameTime: number;
}

export interface GameEndEvent {
	playerEndStates: PlayerEndState[];
}

export interface PlayerLeftEvent {
	playerId: string;
}

//Maybe rework targetlocation to put it somewhere else ?
export interface QuestionFoundEvent {
	targetLocation: Point;
	questionDTO: QuestionDTO;
}

export interface QuestionFoundFromBookEvent {
	questionDTO: QuestionDTO;
}

export interface UsersInfoSentEvent {
	usersInfo: UserInfo[];
	hostName: string;
}

export interface HostChangeEvent {
	newHostName: string;
}

export interface QuestionAnsweredEvent {
	questionId: number;
	isAnswerCorrect: boolean;
	playerId: string;
	clientTimestamp: number;
	startTimestamp: number;
	targetLocation: Point;
}

export interface PlayerEndState {
	playerId: string;
	points: number;
	name: string;
	//TODO: Maybe put the user information here
	//to know what character model is used and possibly the grade the player is
}

export interface StartingRaceGridInfo {
	width: number;
	height: number;
	nonWalkablePositions: Point[];
	startingPositions: Point[];
	finishLinePositions: Point[];
	itemStates: ItemState[];
}

export interface QuestionDTO {
	id: number;
	answers: AnswerDTO[];
	answerType: string;
	schoolGradeId: number;
	difficulty: number;
	questionRelativePath: string;
	feedbackRelativePath: string;
}

export interface AnswerDTO {
	label: string;
	isRight: number;
}

export interface InfoForQuestion {
	schoolGrade: number;
	language: string;
}
