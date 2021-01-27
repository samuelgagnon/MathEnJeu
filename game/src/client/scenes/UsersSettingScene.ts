import UserInfo from "../../communication/user/UserInfo";
import { CST } from "../CST";
import { getUserInfo, initializeUserStats, setUserInfo } from "../services/UserInformationService";

export default class UsersSettingScene extends Phaser.Scene {
	private backButton: Phaser.GameObjects.Text;
	private submitButton: Phaser.GameObjects.Text;
	private userSettingsHTML: Phaser.GameObjects.DOMElement;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.USERS_SETTING,
		};
		super(sceneConfig);
	}

	create() {
		this.add.tileSprite(0, 0, Number(this.game.config.width), Number(this.game.config.height), CST.IMAGES.BACKGROUD).setOrigin(0).setDepth(0);

		this.userSettingsHTML = this.add.dom(this.game.renderer.width * 0.5, this.game.renderer.height * 0.3).createFromCache(CST.HTML.USER_SETTINGS);

		if (getUserInfo() !== null) {
			const userInfo = getUserInfo();
			(<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value = userInfo.name;
			(<HTMLInputElement>this.userSettingsHTML.getChildByID("language")).value = userInfo.language;
			(<HTMLInputElement>this.userSettingsHTML.getChildByID("playerRole")).value = userInfo.role;
			(<HTMLInputElement>this.userSettingsHTML.getChildByID("schoolGrades")).value = userInfo.schoolGrade.toString();
		}

		this.backButton = this.add.text(10, 10, "<- back", {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.submitButton = this.add.text(this.game.renderer.width * 0.46, this.game.renderer.height * 0.5, "Submit", {
			fontFamily: "Courier",
			fontSize: "32px",
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.backButton.setInteractive({ useHandCursor: true });
		this.submitButton.setInteractive({ useHandCursor: true });

		this.backButton.on("pointerover", () => {
			this.backButton.setTint(0xffff66);
		});

		this.backButton.on("pointerout", () => {
			this.backButton.clearTint();
		});

		this.backButton.on("pointerdown", () => {
			this.backButton.setTint(0x86bfda);
		});

		this.backButton.on("pointerup", () => {
			this.backButton.clearTint();
			this.scene.start(CST.SCENES.MENU);
		});

		this.submitButton.on("pointerover", () => {
			this.submitButton.setTint(0xffff66);
		});

		this.submitButton.on("pointerout", () => {
			this.submitButton.clearTint();
		});

		this.submitButton.on("pointerdown", () => {
			this.submitButton.setTint(0x86bfda);
		});

		this.submitButton.on("pointerup", () => {
			this.submitButton.clearTint();

			const name = (<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value;
			const language = (<HTMLInputElement>this.userSettingsHTML.getChildByID("language")).value;
			const role = (<HTMLInputElement>this.userSettingsHTML.getChildByID("playerRole")).value;
			const schoolGrade = Number((<HTMLInputElement>this.userSettingsHTML.getChildByID("schoolGrades")).value);

			const userInfo: UserInfo = {
				name: name,
				schoolGrade: schoolGrade,
				language: language,
				role: role,
			};

			setUserInfo(userInfo);
			initializeUserStats();

			this.scene.start(CST.SCENES.ROOM_SELECTION);
		});
	}
}
