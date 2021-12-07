import en from "./en.json";
import fr from "./fr.json";

var userLanguage = window.navigator.language;

const queryString = window.location.search;
if (queryString) {
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has("lang")) {
		userLanguage = urlParams.get("lang");
	}
}

const getTranslate = (text) => {
	var obj = text.substr(0, text.indexOf("."));
	var text = text.substr(text.indexOf(".") + 1);
	if (userLanguage.includes("en")) {
		return en[obj][text];
	} else {
		return fr[obj][text];
	}
};

export { getTranslate, userLanguage };
