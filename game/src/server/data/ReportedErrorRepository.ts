export default interface ReportedErrorRepository {
	addReportedError(languageShortName: string, errorDescription: string, errorLog?: string, username?: string, questionId?: number): void;
}
