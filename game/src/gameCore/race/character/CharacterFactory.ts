import { hslToRgb } from "../../../utils/Utils";
import { randomInteger } from "./../../../utils/Utils";
import Character from "./Character";
import { CHARACTER_CST } from "./CHARACTER_CST";

export default class CharacterFactory {
	public static createRandomCharacter(): Character {
		const padTwoDigitHexNumberWithZero = (twoDigitHexNumber: string) => {
			if (twoDigitHexNumber.length == 1) {
				twoDigitHexNumber = "0" + twoDigitHexNumber;
			}
			return twoDigitHexNumber;
		};
		const randomRgbColor = hslToRgb(Math.random(), CHARACTER_CST.RANDOM_CHARACTER_SATURATION, CHARACTER_CST.RANDOM_CHARACTER_LIGHTNESS);
		const hexColor =
			padTwoDigitHexNumberWithZero(randomRgbColor[0].toString(16)) +
			padTwoDigitHexNumberWithZero(randomRgbColor[1].toString(16)) +
			padTwoDigitHexNumberWithZero(randomRgbColor[2].toString(16));
		const accessoryId = randomInteger(CHARACTER_CST.MIN_ACCESSORY_ID, CHARACTER_CST.MAX_ACCESSORY_ID);
		return new Character(hexColor, accessoryId);
	}
}
