export default interface ReportedErrorRepository {
	addReportedError(languageShortName: string, errorDescription: string, questionId?: number, username?: string): void;
}
