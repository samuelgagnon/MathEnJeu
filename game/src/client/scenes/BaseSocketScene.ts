import { ROOM_EVENT_NAMES } from "../../communication/room/EventNames";
import { Clock } from "../../gameCore/clock/Clock";
import { CST } from "../CST";
import { connectToGameNamespace } from "../services/RoomService";
import { getUserInfo } from "../services/UserInformationService";

export default class BaseSocketScene extends Phaser.Scene {
	protected gameSocket: SocketIOClient.Socket;

	constructor(sceneConfig: any) {
		super(sceneConfig);
	}

	init(data: any) {
		this.gameSocket = this.registry.get("socket");

		if (!!!this.gameSocket || !this.gameSocket.connected) {
			this.gameSocket = connectToGameNamespace(getUserInfo());
		}

		this.gameSocket.once(ROOM_EVENT_NAMES.ROOM_JOINED, () => {
			this.scene.start(CST.SCENES.WAITING_ROOM, { socket: this.gameSocket });
		});
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.gameSocket.removeEventListener(ROOM_EVENT_NAMES.ROOM_JOINED);
			this.registry.set("socket", this.gameSocket);
		});

		if (!Clock.getIsSynchronizedWithServer()) {
			Clock.startSynchronizationWithServer(this.gameSocket);
		}
		this.registry.set("socket", this.gameSocket);
	}
}
