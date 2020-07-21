import axios from "axios";

export const getBase64ImageForQuestion = (questionId: string, languageShortName: string): Promise<string> => {
	return axios({
		method: "get",
		url: "http://localhost:8080/questionImage",
		responseType: "arraybuffer",
		params: {
			id: questionId,
			languageShortName: languageShortName,
		},
	})
		.then((response) => {
			const base64String = Buffer.from(response.data, "binary").toString("base64");
			return `data:image/png;base64,${base64String}`;
		})
		.catch((e) => {
			throw e;
		});
};
