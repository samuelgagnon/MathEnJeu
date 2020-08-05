import axios from "axios";

export const getBase64ImageForQuestion = (questionId: number, languageShortName: string, schoolGradeId: number): Promise<string> => {
	return axios({
		method: "get",
		url: `${process.env.SERVER_API_URL}/questionImage`,
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

export const getBase64ImageForQuestionFeedback = (questionId: number, languageShortName: string, schoolGradeId: number): Promise<string> => {
	return axios({
		method: "get",
		url: `${process.env.SERVER_API_URL}/questionFeedbackImage`,
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
