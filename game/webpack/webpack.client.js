const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
	let mode = "development";
	let outputPath = path.join(__dirname, "../", "dist/client");
	let SERVER_API_URL = "http://localhost:8080";

	if (env.NODE_ENV === "production") {
		mode = "production";
	}

	return {
		mode: mode,
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
			path: outputPath,
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
			new webpack.DefinePlugin({
				"process.env": {
					NODE_ENV: JSON.stringify(mode),
					SERVER_API_URL: JSON.stringify(SERVER_API_URL),
				},
			}),
		],
	};
};
