export const createHtmlQuestion = (scene: Phaser.Scene, x: number, y: number, width: number, height: number, questionId: number) => {
	return scene.add.dom(x, y).createFromHTML(`
			<iframe style="no-border" src="${process.env.SERVER_API_URL}/question-html/${questionId}"></iframe>

			<style>
				iframe {
					width: ${width}px; 
					height: ${height}px;
					border: 0;
				}
			</style>
		`);
};

export const createHtmlFeedback = (scene: Phaser.Scene, x: number, y: number, width: number, height: number, questionId: number) => {
	return scene.add.dom(x, y).createFromHTML(`
			<iframe src="${process.env.SERVER_API_URL}/feedback-html/${questionId}"></iframe>
			
			<style>
				iframe {
					width: ${width}px; 
					height: ${height}px;
					border: 0;
				}
			</style>
		`);
};

export const createHtmlAnswer = (scene: Phaser.Scene, x: number, y: number, answerId: number) => {
	return scene.add.dom(x, y).createFromHTML(`<iframe src="${process.env.SERVER_API_URL}/question-html/${answerId}"></iframe>`);
};
