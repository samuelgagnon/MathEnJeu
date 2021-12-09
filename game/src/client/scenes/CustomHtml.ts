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
				.question-iframe::-webkit-scrollbar{
					width:12px;
					background-color:#cccccc;
				}
				.question-iframe::-webkit-scrollbar:horizontal{
					height:12px;
				}
				.question-iframe::-webkit-scrollbar-track{
					border:1px #787878 solid;
					border-radius:10px;
					-webkit-box-shadow:0 0 6px #c8c8c8 inset;
				}
				.question-iframe::-webkit-scrollbar-thumb{
					background-color:#b03c3f;
					border:1px solid #000000;
					border-radius:16px;
				}
				.question-iframe::-webkit-scrollbar-thumb:hover{
					background-color:#bf4649;
					border:1px solid #333333;
				}
				.question-iframe::-webkit-scrollbar-thumb:active{
					background-color:#a6393d;
					border:1px solid #333333;
				}
				.question-iframe {
					width: ${width}px; 
					height: ${height}px;
					border: 0;
				}
				.question-iframe{
					width: 1000px !important;
					height: 27vh !important;
					border: 0 !important;
				}
				.question-iframe, .feedback-iframe{
					background-color:rgba(255,255,255,1);
					border-radius:20px;
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
					width: 1000px!important;
					height: 38vh!important;
					border: 0 !important;
					margin-top: 0px !important;
				}
			</style>
		`);
};
export const createHtmlMultiChoiceQuestion = (
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
				.question-iframe::-webkit-scrollbar{
					width:12px;
					background-color:#cccccc;
				}
				.question-iframe::-webkit-scrollbar:horizontal{
					height:12px;
				}
				.question-iframe::-webkit-scrollbar-track{
					border:1px #787878 solid;
					border-radius:10px;
					-webkit-box-shadow:0 0 6px #c8c8c8 inset;
				}
				.question-iframe::-webkit-scrollbar-thumb{
					background-color:#b03c3f;
					border:1px solid #000000;
					border-radius:16px;
				}
				.question-iframe::-webkit-scrollbar-thumb:hover{
					background-color:#bf4649;
					border:1px solid #333333;
				}
				.question-iframe::-webkit-scrollbar-thumb:active{
					background-color:#a6393d;
					border:1px solid #333333;
				}
				.question-iframe{
					width: 600px !important;
					height: 38vh !important;
					border: 0 !important;
				}
				.question-iframe, .feedback-iframe{
					background-color:rgba(255,255,255,1);
					border-radius:20px;
				}
			</style>
		`);
};

export const createHtmlMultiChoiceFeedback = (
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
					width: 600px!important;
					height: 38vh!important;
					border: 0 !important;
					margin-top: 0px !important;
				}
			</style>
		`);
};
// 798f95
export const createHtmlAnswer = (
	scene: Phaser.Scene,
	x: number,
	y: number,
	width: number,
	height: number,
	answerId: number,
	languageShortName: string
) => {
	console.log("answerId: ", answerId);
	return scene.add.dom(x, y).createFromHTML(`
			<iframe class="answer-iframe" src="${process.env.SERVER_API_URL}/answer-html/${answerId}?lg=${languageShortName}"></iframe>
		
			<style>
				.answer-iframe{
					text-align:center;
					width: 180px !important;
					height: 180px !important;
					border: 3px solid #798f95;
					border-radius:20px;
					cursor:pointer;
					background-color: #FFFFFF;
				}
				.answer-iframe:hover{
					background-color: #FFFFFF;
				}
				.answer-iframe p{
					text-align: center;
				}
				.answer-div {
					width: 180px; 
					height: 180px;
					cursor: pointer;
				}
			</style>
		`);
};

export const createInvisibleDiv = (scene: Phaser.Scene, x: number, y: number, width: number, height: number) => {
	return scene.add.dom(x, y).createFromHTML(`
			<div class="answer-div"></div>
		
			<style>
			</style>
		`);
};
