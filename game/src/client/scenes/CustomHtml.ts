export const createHtmlQuestion = (
	scene: Phaser.Scene,
	x: number,
	y: number,
	width: number,
	height: number,
	questionId: number,
	languageShortName: string
) => {
	return scene.add.dom(x, y).createFromHTML(`
			<iframe class="question-iframe" src="${process.env.SERVER_API_URL}/question-html/${questionId}?lg=${languageShortName}"></iframe>

			<style>
				.question-iframe {
					width: ${width}px; 
					height: ${height}px;
					border: 0;
				}
			</style>
		`);
};

export const createHtmlFeedback = (
	scene: Phaser.Scene,
	x: number,
	y: number,
	width: number,
	height: number,
	questionId: number,
	languageShortName: string
) => {
	return scene.add.dom(x, y).createFromHTML(`
			<iframe class="feedback-iframe" src="${process.env.SERVER_API_URL}/feedback-html/${questionId}?lg=${languageShortName}"></iframe>
			
			<style>
				.feedback-iframe {
					width: ${width}px; 
					height: ${height}px;
					border: 0;
				}
			</style>
		`);
};

export const createHtmlAnswer = (
	scene: Phaser.Scene,
	x: number,
	y: number,
	width: number,
	height: number,
	answerId: number,
	languageShortName: string
) => {
	return scene.add.dom(x, y).createFromHTML(`
			<iframe class="answer-iframe" src="${process.env.SERVER_API_URL}/answer-html/${answerId}?lg=${languageShortName}"></iframe>
		
			<style>
				.answer-iframe {
					width: ${width}px; 
					height: ${height}px;
				}
			</style>
		`);
};

export const createInvisibleDiv = (scene: Phaser.Scene, x: number, y: number, width: number, height: number) => {
	return scene.add.dom(x, y).createFromHTML(`
			<div class="answer-div"></div>
		
			<style>
				.answer-div {
					width: ${width}px; 
					height: ${height}px;
				}
			</style>
		`);
};
