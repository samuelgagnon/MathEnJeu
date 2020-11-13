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
	return values.reduce((a, b) => a + b) / values.length;
};

export const standardDeviation = (values: number[]) => {
	const n = values.length;
	const mean = values.reduce((a, b) => a + b) / values.length;
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
