import axios from "axios";
import ErrorReport from "../../communication/ErrorReport";

export const postErrorReport = (errorReport: ErrorReport) => {
	return axios({
		method: "post",
		url: `${process.env.SERVER_API_URL}/errorReport`,
		data: {
			languageShortName: errorReport.languageShortName,
			errorDescription: errorReport.errorDescription,
			errorLog: errorReport.errorLog,
			username: errorReport.username,
			questionId: errorReport.questionId,
		},
	}).catch((e) => {
		throw e;
	});
};
