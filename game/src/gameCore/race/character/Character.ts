import { isHexColor } from "../../../utils/Utils";
import { CHARACTER_CST } from "./CHARACTER_CST";

export default class Character {
	private hexColor: string; //RGB. Ex.:"FF0000" for red.
	private accessoryId: number;
	constructor(hexColor = CHARACTER_CST.DEFAULT_HEX_COLOR, accessoryId = CHARACTER_CST.DEFAULT_ACCESSORY_ID) {
		if (!isHexColor(hexColor)) {
			hexColor = CHARACTER_CST.DEFAULT_HEX_COLOR;
		}
		this.hexColor = hexColor;
		if (!this.isAccessoryIdValid(accessoryId)) {
			accessoryId = CHARACTER_CST.DEFAULT_ACCESSORY_ID;
		}
		this.accessoryId = accessoryId;
	}

	private isAccessoryIdValid(accessoryId: number): boolean {
		return Number.isInteger(accessoryId) && accessoryId <= CHARACTER_CST.MAX_ACCESSORY_ID && accessoryId >= CHARACTER_CST.MIN_ACCESSORY_ID;
	}

	public getHexColor(): string {
		return this.hexColor;
	}

	public setHexColor(hexColor: string): void {
		if (isHexColor(hexColor)) {
			this.hexColor = hexColor;
		}
	}

	public getAccessoryId(): number {
		return this.accessoryId;
	}

	public setAccessoryId(accessoryId: number): void {
		if (this.isAccessoryIdValid(accessoryId)) {
			this.accessoryId = accessoryId;
		}
	}
}
