export default interface ErrorReport {
	languageShortName: string;
	errorDescription: string;
	errorLog?: object;
	username?: string;
	questionId?: number;
}
