export default class KickButton extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene, x: number, y: number, fontSize: number, callBack: Function) {
		super(scene, x, y, "Kick", {
			fontFamily: "Courier",
			fontSize: `${fontSize}px`,
			align: "center",
			color: "#FDFFB5",
			fontStyle: "bold",
		});

		this.on("pointerover", () => {
			this.setTint(0xffff66);
		});

		this.on("pointerout", () => {
			this.clearTint();
		});

		this.on("pointerdown", () => {
			this.setTint(0x86bfda);
		});

		this.on("pointerup", () => {
			this.clearTint();
		});

		this.setInteractive({ handCursor: true });
	}
}
