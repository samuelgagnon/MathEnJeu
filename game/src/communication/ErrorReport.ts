export default interface ErrorReport {
	languageShortName: string;
	errorDescription: string;
	errorLog?: string;
	username?: string;
	questionId?: number;
}
