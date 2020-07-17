import { Socket } from "socket.io";
import BufferedInput from "../../Communication/Race/bufferedInput";
import { GameStartEvent, ItemUsedEvent, MoveRequestEvent, StartingRaceGridInfo } from "../../Communication/Race/dataInterfaces";
import { CLIENT_EVENT_NAMES, EVENT_NAMES as e } from "../../Communication/Race/eventNames";
import PlayerState from "../../Communication/Race/playerState";
import RaceGameState from "../../Communication/Race/raceGameState";
import User from "../../server/data/user";
import { getObjectValues } from "../../utils/utils";
import { ServerGame } from "../game";
import GameFSM from "../gameState/gameFSM";
import State from "../gameState/state";
import PreGameFactory from "../gameState/stateFactory";
import Player from "./player/player";
import RaceGameController from "./raceGameController";
import RaceGrid from "./raceGrid";

export default class ServerRaceGameController extends RaceGameController implements State, ServerGame {
	private context: GameFSM;
	private inputBuffer: BufferedInput[] = [];
	private isGameStarted: boolean = false;
	private gameId: string;

	constructor(gameTime: number, grid: RaceGrid, players: Player[], users: User[], gameId: string) {
		//The server has the truth regarding the start timestamp.
		super(gameTime, Date.now(), grid, players);
		this.handleAllUsersSocketEvents(users);
	}

	public setContext(context: GameFSM): void {
		this.context = context;
	}

	public getGameId(): string {
		return this.gameId;
	}

	private emitStartGameEvent(): void {
		this.isGameStarted = true;
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CLIENT_EVENT_NAMES.GAME_START, <GameStartEvent>{
				gameTime: this.gameTime,
				gameStartTimeStamp: this.gameStartTimeStamp,
				grid: <StartingRaceGridInfo>{
					width: this.grid.getWidth(),
					height: this.grid.getHeight(),
					startingPositions: this.grid.getStartingPositions(),
					finishLinePositions: this.grid.getFinishLinePosition(),
					itemStates: this.grid.getItemsState(),
				},
				players: this.getPlayersState(),
			});
	}

	private getGameState(): RaceGameState {
		let gameState: RaceGameState = { itemsState: [], players: [], remainingTime: this.timeRemaining };
		gameState.itemsState = this.grid.getItemsState();
		this.players.forEach((player: Player) => {
			gameState.players.push(player.getPlayerState());
		});

		return gameState;
	}

	public update(): void {
		if (!this.isGameStarted) this.emitStartGameEvent();
		this.resolveInputs();
		super.update();
		this.context.getNamespace().to(this.context.getRoomString()).emit(e.GAME_UPDATE, this.getGameState());
	}

	protected gameFinished(): void {
		this.removeAllUsersSocketEvents();
		this.context.gameFinished(this);
		this.context.transitionTo(PreGameFactory.createPreGame());
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {
		this.removeSocketEvents(user.socket);
	}

	private handleSocketEvents(socket: Socket): void {
		socket.on(e.ITEM_USED, (data: ItemUsedEvent) => {
			const newInput: BufferedInput = { eventType: e.ITEM_USED, data: data };
			this.inputBuffer.push(newInput);
		});

		socket.on(e.MOVE_REQUEST, (data: MoveRequestEvent) => {
			const newInput: BufferedInput = { eventType: e.MOVE_REQUEST, data: data };
			this.inputBuffer.push(newInput);
		});
	}

	private removeSocketEvents(socket: Socket): void {
		const events = getObjectValues(e);
		for (var key in events) {
			if (events.hasOwnProperty(key)) {
				socket.removeAllListeners(events[key]);
			}
		}
	}

	private handleAllUsersSocketEvents(users: User[]): void {
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}

	private removeAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
		users.forEach((user) => this.handleSocketEvents(user.socket));
	}

	public resolveInputs(): void {
		this.inputBuffer.forEach((input: BufferedInput) => {
			let inputData: any = input.data;
			switch (input.eventType) {
				case e.ITEM_USED:
					this.itemUsed((<ItemUsedEvent>inputData).itemType, (<ItemUsedEvent>inputData).targetPlayerId, (<ItemUsedEvent>inputData).fromPlayerId);
					break;

				case e.MOVE_REQUEST:
					this.movePlayerTo(
						(<MoveRequestEvent>inputData).playerId,
						(<MoveRequestEvent>inputData).startTimestamp,
						(<MoveRequestEvent>inputData).targetLocation
					);
					break;

				default:
					break;
			}
		});
		this.inputBuffer = [];
	}

	private getPlayersState(): PlayerState[] {
		let playersState: PlayerState[] = [];
		this.players.forEach((player: Player) => {
			playersState.push(player.getPlayerState());
		});
		return playersState;
	}
}
