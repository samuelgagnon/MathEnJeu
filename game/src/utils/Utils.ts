export const getObjectValues = (obj: any) => {
	const res = {};
	const recurse = (obj, current?) => {
		for (const key in obj) {
			let value = obj[key];
			if (value != undefined) {
				if (value && typeof value === "object") {
					recurse(value, key);
				} else {
					// Do your stuff here to var value
					res[key] = value;
				}
			}
		}
	};
	recurse(obj);
	return res;
};

export const arithmeticMean = (values: number[]) => {
	let total = 0;
	values.forEach((element) => {
		total += element;
	});
	return total / values.length;
};

export const standardDeviation = (values: number[]) => {
	const n = values.length;
	const mean = arithmeticMean(values);
	return Math.sqrt(values.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
};

export const median = (values: number[]) => {
	if (values.length === 0) return 0;
	values.sort(function (a, b) {
		return a - b;
	});
	var half = Math.floor(values.length / 2);
	if (values.length % 2) return values[half];
	return (values[half - 1] + values[half]) / 2.0;
};

export const isHexColor = (hexColor: string): boolean => {
	return typeof hexColor === "string" && hexColor.length === 6 && !isNaN(Number("0x" + hexColor));
};

export const randomInteger = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
export const hslToRgb = (h: number, s: number, l: number): number[] => {
	let r: number, g: number, b: number;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p: number, q: number, t: number): number => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
