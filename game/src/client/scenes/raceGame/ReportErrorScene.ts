import ErrorReport from "../../../communication/ErrorReport";
import { Clock } from "../../../gameCore/clock/Clock";
import { CST } from "../../CST";
import { postErrorReport } from "../../services/ReportErrorService";
import { getUserInfo } from "../../services/UserInformationService";
import { EventNames, sceneEvents, subscribeToEvent } from "./RaceGameEvents";

export default class ReportErrorScene extends Phaser.Scene {
	position: Point;
	width: number;
	height: number;

	//questionId is null if the error isn't tied to a question
	questionId: number;

	errorType: string;
	reportButton: Phaser.GameObjects.Text;
	cancelButton: Phaser.GameObjects.Text;
	inputHtml: Phaser.GameObjects.DOMElement;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.REPORT_ERROR,
		};
		super(sceneConfig);
	}

	init(data: any) {
		this.questionId = data.questionId;
		this.width = Number(this.game.config.width) * 0.7;
		this.height = Number(this.game.config.height) * 0.8;

		var x = Number(this.game.config.width) * 0.1;
		var y = Number(this.game.config.height) * 0.05;
		this.position = { x: x, y: y };
	}

	create() {
		this.cameras.main.setViewport(this.position.x, this.position.y, this.width, this.height);
		this.cameras.main.setBackgroundColor(0x828282);
		this.inputHtml = this.add.dom(this.width * 0.5, this.height * 0.4).createFromCache(CST.HTML.ERROR_REPORT);

		this.reportButton = this.add
			.text(this.width / 4, this.height * 0.8, "Confirm", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0)
			.setInteractive({
				useHandCursor: true,
			});

		this.cancelButton = this.add
			.text((this.width * 3) / 4, this.height * 0.8, "Cancel", {
				fontFamily: "Courier",
				fontSize: "32px",
				align: "center",
				color: "#000000",
				fontStyle: "bold",
			})
			.setScrollFactor(0)
			.setInteractive({
				useHandCursor: true,
			});

		this.reportButton.on("pointerup", () => {
			const userInfo = getUserInfo();
			const errorReport = <ErrorReport>{
				languageShortName: userInfo.language,
				errorDescription: (<HTMLInputElement>this.inputHtml.getChildByID("errorDetail")).value,
				errorLog: {
					latency: Clock.getLatency(),
					deltaSync: Clock.getDelta(),
				},
				username: userInfo.name,
				questionId: this.questionId,
			};
			postErrorReport(errorReport);
			this.destroyScene();
		});

		this.cancelButton.on("pointerup", () => {
			this.destroyScene();
		});

		subscribeToEvent(EventNames.gameEnds, () => this.scene.stop(), this);
	}

	private destroyScene(): void {
		// parameter is to notify other scenes if it was an error tied to a question or a general error
		sceneEvents.emit(EventNames.errorWindowClosed, this.questionId !== null);
		this.scene.stop(CST.SCENES.REPORT_ERROR);
	}
}
