import axios from "axios";

export const getBase64ImageForQuestion = (questionId: string, languageShortName: string, schoolGradeId: string): Promise<string> => {
	return axios({
		method: "get",
		url: "http://localhost:8080/questionImage",
		responseType: "arraybuffer",
		params: {
			id: questionId,
			languageShortName: languageShortName,
			schoolGradeId: schoolGradeId,
		},
	})
		.then((response) => {
			const base64String = Buffer.from(response.data, "binary").toString("base64");
			console.log(base64String);
			return `data:image/png;base64,${base64String}`;
		})
		.catch((e) => {
			throw e;
		});
};

export const getBase64ImageForQuestionFeedback = (questionId: string, languageShortName: string, schoolGradeId: string): Promise<string> => {
	return axios({
		method: "get",
		url: "http://localhost:8080/questionFeedbackImage",
		responseType: "arraybuffer",
		params: {
			id: questionId,
			languageShortName: languageShortName,
			schoolGradeId: schoolGradeId,
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
