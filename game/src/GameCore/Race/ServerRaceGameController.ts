import { Socket } from "socket.io";
import BufferedInput from "../../Communication/Race/bufferedInput";
import { ItemUsedEvent, MoveRequestEvent } from "../../Communication/Race/dataInterfaces";
import { EVENT_NAMES as e } from "../../Communication/Race/eventNames";
import RaceGameState from "../../Communication/Race/raceGameState";
import User from "../../server/data/user";
import { getObjectValues } from "../../utils/utils";
import { ServerGame } from "../game";
import GameFSM from "../gameState/gameFSM";
import State from "../gameState/state";
import PreGameFactory from "../gameState/stateFactory";
import Player from "./player/player";
import RaceGameController from "./RaceGameController";
import RaceGrid from "./RaceGrid";

export default class ServerRaceGameController extends RaceGameController implements State, ServerGame {
	private context: GameFSM;
	private inputBuffer: BufferedInput[] = [];

	constructor(gameTime: number, grid: RaceGrid, players: Player[]) {
		//The server has the truth regarding the start timestamp.
		super(gameTime, Date.now(), grid, players);
		this.handleAllUsersSocketEvents();
	}

	public setContext(context: GameFSM): void {
		this.context = context;
	}

	public getGameId(): string {
		return this.context.getId();
	}

	public getGameState(): RaceGameState {
		let gameState: RaceGameState;
		this.players.forEach((player: Player) => {
			gameState.players.push(player.getPlayerState());
		});

		return gameState;
	}

	public update(): void {
		this.resolveInputs();
		super.update();
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

	private handleAllUsersSocketEvents(): void {
		const users = this.context.getUsers();
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
					this.movePlayerTo((<MoveRequestEvent>inputData).playerId, (<MoveRequestEvent>inputData).targetLocation);
					break;

				default:
					break;
			}
		});
	}
}
