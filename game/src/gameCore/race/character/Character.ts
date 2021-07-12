export default class Character {
	private hexColor: string; //ex.:"FF0000" for red.
	private accessoryId: number;
	constructor(hexColor = "000000", accessoryId = 1) {
		this.hexColor = hexColor;
		this.accessoryId = accessoryId;
	}

	public getHexColor(): string {
		return this.hexColor;
	}

	public setHexColor(hexColor: string): void {
		this.hexColor = hexColor;
	}

	public getAccessoryId(): number {
		return this.accessoryId;
	}

	public setAccessoryId(accessoryId: number): void {
		this.accessoryId = accessoryId;
	}
}
