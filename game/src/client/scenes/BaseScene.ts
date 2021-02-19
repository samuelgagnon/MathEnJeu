import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { Clock } from "../../gameCore/clock/Clock";
import { CST } from "../CST";
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

		gameSocket.once(ROOM_EVENT_NAMES.ROOM_JOINED, () => {
			this.scene.start(CST.SCENES.WAITING_ROOM, { socket: gameSocket });
		});
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			gameSocket.removeEventListener(ROOM_EVENT_NAMES.ROOM_JOINED);
			this.registry.set("socket", gameSocket);
		});

		if (!Clock.getIsSynchronizedWithServer()) {
			Clock.startSynchronizationWithServer(gameSocket);
		}
		this.registry.set("socket", gameSocket);

		return gameSocket;
	}
}
