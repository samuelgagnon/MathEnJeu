import { joinRoomAnswerEvent } from "../../communication/room/DataInterfaces";
import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { Clock } from "../../gameCore/clock/Clock";
import { JOIN_ROOM_ERROR_NAME } from "../../server/rooms/JoinRoomErrors";
import { CST } from "../CST";
import { localizedString } from "../Localization";
import { connectToGameNamespace } from "../services/RoomService";
import { getUserInfo } from "../services/UserInformationService";

export default class BaseScene extends Phaser.Scene {
	constructor(sceneConfig: any) {
		super(sceneConfig);
	}

	initializeSocket(): SocketIOClient.Socket {
		let gameSocket = this.registry.get("socket");

		if (!!!gameSocket || !gameSocket.connected) {
			gameSocket = connectToGameNamespace(getUserInfo());
		}

		gameSocket.once(ROOM_EVENT_NAMES.JOIN_ROOM_ANSWER, (data: joinRoomAnswerEvent) => {
			if (!!!data.error) {
				this.scene.start(CST.SCENES.WAITING_ROOM, { socket: gameSocket, roomId: data.roomId });
			} else {
				const language = getUserInfo().language;
				let errorMsg: localizedString;
				switch (data.error.name) {
					case JOIN_ROOM_ERROR_NAME.FULL:
						errorMsg = {
							fr: `La salle ${data.roomId} est pleine.`,
							en: `Room ${data.roomId} is full.`,
						};
						break;
					case JOIN_ROOM_ERROR_NAME.GAME_IN_PROGRESS:
						errorMsg = {
							fr: `La partie de la salle ${data.roomId} est déjà commencée.`,
							en: `Room ${data.roomId} game is in progress.`,
						};
						break;
					case JOIN_ROOM_ERROR_NAME.NOT_FOUND:
						errorMsg = {
							fr: `La salle ${data.roomId} n'existe pas.`,
							en: `Room ${data.roomId} doesn't exist.`,
						};
						break;

					default:
						errorMsg = {
							fr: `Erreur inconnue. Impossible de joindre la salle ${data.roomId}.`,
							en: `Unknown error. Cannot join room ${data.roomId}.`,
						};
						break;
				}

				alert(errorMsg[language]);
			}
		});
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			gameSocket.removeEventListener(ROOM_EVENT_NAMES.JOIN_ROOM_ANSWER);
			this.registry.set("socket", gameSocket);
		});

		if (!Clock.getIsSynchronizedWithServer()) {
			Clock.startSynchronizationWithServer(gameSocket);
		}
		this.registry.set("socket", gameSocket);

		return gameSocket;
	}
}
