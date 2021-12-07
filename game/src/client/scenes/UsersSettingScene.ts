import UserInfo from "../../communication/user/UserInfo";
import { getTranslate, userLanguage } from "../assets/locales/translate";
import { CST } from "../CST";
import { getUserInfo, initializeUserStats, setUserInfo } from "../services/UserInformationService";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../GameConfig";

export default class UsersSettingScene extends Phaser.Scene {
	private submitButton: Phaser.GameObjects.Rectangle;
	private userSettingsHTML: Phaser.GameObjects.DOMElement;
	private name: Phaser.GameObjects.Text;
	private playText: Phaser.GameObjects.Text;
	private commentModalImage: Phaser.GameObjects.Image;
	private closeButton: Phaser.GameObjects.Rectangle;
	private commentButton: Phaser.GameObjects.Rectangle;
	private goalText: Phaser.GameObjects.Text;
	private description: Phaser.GameObjects.Text;
	private commentText: Phaser.GameObjects.Text;
	private objects: Phaser.GameObjects.Text;
	private increaseMoment: Phaser.GameObjects.Text;
	private exchangeQue: Phaser.GameObjects.Text;
	private showDown: Phaser.GameObjects.Text;
	private eliminates: Phaser.GameObjects.Text;
	private returnText: Phaser.GameObjects.Text;
	private backImage: Phaser.GameObjects.Image;
	private comment: Phaser.GameObjects.Text;
	private logo: Phaser.GameObjects.Image;

	constructor() {
		const sceneConfig = {
			key: CST.SCENES.USERS_SETTING,
		};
		super(sceneConfig);
	}
	create() {
		this.scale.setGameSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
		document.body.style.backgroundImage = 'url("static/client/assets/images/New_Background.png")';
		document.body.style.backgroundSize = "cover";
		document.body.style.backgroundRepeat = "no-repeat";
		this.input.keyboard.clearCaptures();
		this.sound.add(CST.SOUND.TransitionInterfaces_04).play();
		// this.add.image(Number(this.game.config.width) / 2 + 6, Number(this.game.config.height) / 2 + 18, CST.IMAGES.BACKGROUD).setScale(0.71, 0.713);
		this.backImage = this.add.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 1.55, CST.IMAGES.MAIN_SCREEN_BACK).setScale(0.72);
		this.logo = this.add.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 4.3, CST.IMAGES.LOGO);
		this.userSettingsHTML = this.add.dom(Number(this.game.config.width) * 0.505, this.backImage.y - 70).createFromCache(CST.HTML.USER_SETTINGS);
		(<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).placeholder = getTranslate("userSettings.enterName");

		this.name = this.add.text(this.backImage.x, this.backImage.y - 130, getTranslate("userSettings.name"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "20px",
			align: "center",
			color: "#fff",
		});

		this.name.setX(this.name.x - this.name.width / 2 - this.userSettingsHTML.width / 5.05);

		var schoolLevel = this.add.text(this.backImage.x + 33, this.backImage.y - 130, getTranslate("userSettings.schoolLevel"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "20px",
			align: "center",
			color: "#fff",
		});
		schoolLevel.setX(schoolLevel.x - schoolLevel.width / 2 + this.userSettingsHTML.width / 6.8);

		if (getUserInfo() !== null) {
			const userInfo = getUserInfo();
			(<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value = userInfo.name;
			(<HTMLInputElement>this.userSettingsHTML.getChildByID("schoolGrades")).value = userInfo.schoolGrade.toString();
		}

		var schoolGrades = <HTMLInputElement>this.userSettingsHTML.getChildByID("schoolGrades");
		schoolGrades[0].innerHTML = getTranslate("schoolLevel.general");
		schoolGrades[1].innerHTML = getTranslate("schoolLevel.oneYear");
		schoolGrades[2].innerHTML = getTranslate("schoolLevel.secondYear");
		schoolGrades[3].innerHTML = getTranslate("schoolLevel.thirdYear");
		schoolGrades[4].innerHTML = getTranslate("schoolLevel.grade4");
		schoolGrades[5].innerHTML = getTranslate("schoolLevel.grade5");
		schoolGrades[6].innerHTML = getTranslate("schoolLevel.grade6");
		schoolGrades[7].innerHTML = getTranslate("schoolLevel.secondary1");
		schoolGrades[8].innerHTML = getTranslate("schoolLevel.secondary2");
		schoolGrades[9].innerHTML = getTranslate("schoolLevel.secondary3");
		schoolGrades[10].innerHTML = getTranslate("schoolLevel.secondary4cst");
		schoolGrades[11].innerHTML = getTranslate("schoolLevel.secondary4ts");
		schoolGrades[12].innerHTML = getTranslate("schoolLevel.secondary4sn");
		schoolGrades[13].innerHTML = getTranslate("schoolLevel.secondary5csn");
		schoolGrades[14].innerHTML = getTranslate("schoolLevel.secondary5ts");
		schoolGrades[15].innerHTML = getTranslate("schoolLevel.secondary5sn");
		schoolGrades[16].innerHTML = getTranslate("schoolLevel.cegep1");
		schoolGrades[17].innerHTML = getTranslate("schoolLevel.cegep2");

		this.playText = this.add.text(this.backImage.x + 5, this.backImage.y - 13, getTranslate("userSettings.play"), {
			fontFamily: "ArcherBoldPro",
			fontSize: "67px",
			align: "center",
			color: "#FFF",
		});
		this.playText.setX(this.playText.x - this.playText.width / 2);
		this.submitButton = this.add.rectangle(this.backImage.x, this.backImage.y + 27, 430, 90).setInteractive({ useHandCursor: true });

		this.submitButton
			.on("pointerover", () => {
				const name = (<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value;
				if (name.trim()) {
					this.playText.setTint(0xffff66);
				}
			})
			.on("pointerout", () => {
				this.playText.clearTint();
			})
			.on("pointerdown", () => {
				const name = (<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value;
				if (name.trim()) {
					this.playText.setTint(0x86bfda);
				}
			})
			.on("pointerup", () => {
				this.playText.clearTint();
				const name = (<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value;
				if (name.trim()) {
					this.submit();
				}
			});

		this.comment = this.add
			.text(this.backImage.x + 5, this.backImage.y + 145, getTranslate("userSettings.comment"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "27px",
				align: "center",
				color: "#FFF",
			})
		this.comment.setX(this.comment.x - this.comment.width / 2);
		this.commentButton = this.add.rectangle(this.backImage.x, this.backImage.y + 158, 290, 62).setInteractive({ useHandCursor: true });
		this.commentButton
			.on("pointerover", () => {
				this.comment.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.comment.clearTint();
			})
			.on("pointerdown", () => {
				this.comment.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.comment.clearTint();
				this.toggleCommentModal(true);
			});
		this.commentModalImage = this.add
			.image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2, CST.IMAGES.COMMENT_MODAL)
			.setScale(1)
			.setScale(0.75)
			.setVisible(false);
		this.closeButton = this.add
			.rectangle(this.commentModalImage.x + 265, this.commentModalImage.y - 260, 40, 40)
			.setInteractive({ useHandCursor: true })
			.setVisible(false);
		this.closeButton.on("pointerup", () => {
			this.toggleCommentModal(false);
		});
		this.commentText = this.add
			.text(this.commentModalImage.x, this.commentModalImage.y - 205, getTranslate("userSettings.howToPlay"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "35px",
				align: "center",
				color: "#FFF",
			})
			.setVisible(false);
		this.commentText.setX(this.commentText.x - this.commentText.width / 2);

		this.goalText = this.add
			.text(this.commentModalImage.x - 175, this.commentModalImage.y - 130, getTranslate("userSettings.goal"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "21px",
				align: "center",
				color: "#24DACF",
			})
			.setVisible(false);
		this.description = this.add
			.text(this.commentModalImage.x - 175, this.commentModalImage.y - 95, getTranslate("userSettings.description"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "15px",
				color: "#fff",
			})
			.setVisible(false);
		this.objects = this.add
			.text(this.commentModalImage.x - 175, this.commentModalImage.y - 30, getTranslate("userSettings.items"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "21px",
				align: "center",
				color: "#24DACF",
			})
			.setVisible(false);

		this.increaseMoment = this.add
			.text(this.commentModalImage.x - 120, this.commentModalImage.y + 16, getTranslate("userSettings.increaseMoment"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "15px",
				color: "#fff",
			})
			.setVisible(false);
		this.exchangeQue = this.add
			.text(this.commentModalImage.x - 120, this.commentModalImage.y + 74, getTranslate("userSettings.exchangeQue"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "15px",
				color: "#fff",
			})
			.setVisible(false);
		this.showDown = this.add
			.text(this.commentModalImage.x + 82, this.commentModalImage.y + 16, getTranslate("userSettings.showDown"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "15px",
				color: "#fff",
			})
			.setVisible(false);
		this.eliminates = this.add
			.text(this.commentModalImage.x + 82, this.commentModalImage.y + 74, getTranslate("userSettings.eliminates"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "15px",
				color: "#fff",
			})
			.setVisible(false);

		this.returnText = this.add
			.text(this.commentModalImage.x, this.commentModalImage.y + 161, getTranslate("userSettings.returnToMenu"), {
				fontFamily: "ArcherBoldPro",
				fontSize: "22px",
				color: "#fff",
			})
			.setVisible(false)
			.setInteractive({ useHandCursor: true });
		this.returnText.setX(this.returnText.x - this.returnText.width / 2 + 7);
		this.returnText
			.on("pointerover", () => {
				this.returnText.setTint(0xffff66);
			})
			.on("pointerout", () => {
				this.returnText.clearTint();
			})
			.on("pointerdown", () => {
				this.returnText.setTint(0x86bfda);
			})
			.on("pointerup", () => {
				this.returnText.clearTint();
				this.toggleCommentModal(false);
			});
	}
	update() {
		const name = (<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value;
		if (name.trim()) {
			this.playText.setAlpha(1);
			this.submitButton.setInteractive({ useHandCursor: true });
		} else {
			this.playText.setAlpha(0.7);
			this.submitButton.disableInteractive();
		}
	}

	private toggleCommentModal(isModal): void {
		this.commentModalImage.setVisible(isModal);
		this.userSettingsHTML.setVisible(!isModal);
		this.closeButton.setVisible(isModal);
		this.commentText.setVisible(isModal);
		this.goalText.setVisible(isModal);
		this.description.setVisible(isModal);
		this.objects.setVisible(isModal);
		this.increaseMoment.setVisible(isModal);
		this.exchangeQue.setVisible(isModal);
		this.showDown.setVisible(isModal);
		this.eliminates.setVisible(isModal);
		this.returnText.setVisible(isModal);
		if (isModal) {
			this.commentButton.disableInteractive();
			this.comment.setAlpha(0.2);
			this.backImage.setAlpha(0.2);
			this.logo.setAlpha(0.2);
		} else {
			this.commentButton.setInteractive({ useHandCursor: true });
			this.comment.setAlpha(0.7);
			this.backImage.setAlpha(1);
			this.logo.setAlpha(1);
		}
	}

	private submit(): void {
		const name = (<HTMLInputElement>this.userSettingsHTML.getChildByID("nameInput")).value;
		const schoolGrade = Number((<HTMLInputElement>this.userSettingsHTML.getChildByID("schoolGrades")).value);
		const userInfo: UserInfo = {
			name: name,
			schoolGrade: schoolGrade,
			language: userLanguage.includes("en") ? "en" : "fr",
			role: "student",
		};
		setUserInfo(userInfo);
		initializeUserStats();
		this.scene.start(CST.SCENES.ROOM_CREATION);
	}
}
