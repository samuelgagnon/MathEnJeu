export const getObjectValues = (obj) => {
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
