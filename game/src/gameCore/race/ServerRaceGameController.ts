import { Socket } from "socket.io";
import BufferedInput from "../../communication/race/BufferedInput";
import {
	GameEndEvent,
	GameStartEvent,
	ItemUsedEvent,
	MoveRequestEvent,
	PlayerEndState,
	PlayerLeftEvent,
	StartingRaceGridInfo,
} from "../../communication/race/DataInterfaces";
import { CLIENT_EVENT_NAMES as CE, SERVER_EVENT_NAMES as SE } from "../../communication/race/EventNames";
import PlayerState from "../../communication/race/PlayerState";
import RaceGameState from "../../communication/race/RaceGameState";
import User from "../../server/data/User";
import { getObjectValues } from "../../utils/Utils";
import { ServerGame } from "../Game";
import GameFSM from "../gameState/GameFSM";
import State from "../gameState/State";
import PreGameFactory from "../gameState/StateFactory";
import Player from "./player/Player";
import RaceGameController from "./RaceGameController";
import RaceGrid from "./RaceGrid";

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
			.emit(CE.GAME_START, <GameStartEvent>{
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
		if (this.timeRemaining < 0) this.gameFinished();
		this.context.getNamespace().to(this.context.getRoomString()).emit(CE.GAME_UPDATE, this.getGameState());
	}

	protected gameFinished(): void {
		const playerEndStates: PlayerEndState[] = this.getPlayersState().map((playerState) => {
			return { playerId: playerState.id, points: playerState.points, name: playerState.name };
		});
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.GAME_END, <GameEndEvent>{ playerEndStates: playerEndStates });
		this.removeAllUsersSocketEvents();
		this.context.gameFinished(this);
		this.context.transitionTo(PreGameFactory.createPreGame(this.context.getUsers()));
	}

	public userJoined(user: User): void {
		this.handleSocketEvents(user.socket);
	}

	public userLeft(user: User): void {
		this.removePlayer(user.userId);
		this.context
			.getNamespace()
			.to(this.context.getRoomString())
			.emit(CE.PLAYER_LEFT, <PlayerLeftEvent>{ playerId: user.userId });
		this.removeSocketEvents(user.socket);
	}

	private handleSocketEvents(socket: Socket): void {
		socket.on(SE.ITEM_USED, (data: ItemUsedEvent) => {
			const newInput: BufferedInput = { eventType: SE.ITEM_USED, data: data };
			this.inputBuffer.push(newInput);
		});

		socket.on(SE.MOVE_REQUEST, (data: MoveRequestEvent) => {
			const newInput: BufferedInput = { eventType: SE.MOVE_REQUEST, data: data };
			this.inputBuffer.push(newInput);
		});
	}

	private removeSocketEvents(socket: Socket): void {
		const events = getObjectValues(SE);
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
				case SE.ITEM_USED:
					this.itemUsed((<ItemUsedEvent>inputData).itemType, (<ItemUsedEvent>inputData).targetPlayerId, (<ItemUsedEvent>inputData).fromPlayerId);
					break;

				case SE.MOVE_REQUEST:
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
