const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: "development",
	entry: ["./src/client/index.ts"],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	output: {
		publicPath: "static/client",
		path: path.resolve(__dirname, "../dist/client"),
		filename: "[name].bundle.js",
		chunkFilename: "[name].chunk.js",
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all",
					filename: "[name].bundle.js",
				},
			},
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "src/client/index.html",
		}),
		new CopyWebpackPlugin({
			patterns: [{ from: "src/client/assets", to: "assets" }],
			options: {
				concurrency: 100,
			},
		}),
		new CopyWebpackPlugin({
			patterns: [{ from: "src/client/scenes/htmlElements", to: "scenes/htmlElements" }],
			options: {
				concurrency: 100,
			},
		}),
	],
};
