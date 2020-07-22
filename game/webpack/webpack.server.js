const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = (env) => {
	let mode = "development";
	let outputPath = path.join(__dirname, "../", "dist/server");

	if (env.NODE_ENV === "prod") {
		mode = "production";
	}

	return {
		mode: mode,
		//devtool: "inline-source-map", Verify use
		target: "node",
		node: {
			__dirname: false,
		},
		entry: "./src/server/index.ts",
		output: {
			filename: "server.js",
			path: outputPath,
		},
		resolve: {
			extensions: [".ts", ".tsx", ".js"],
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					include: path.join(__dirname, "../src"),
					loader: "ts-loader",
				},
			],
		},
		externals: [nodeExternals()],
		plugins: [
			new CopyWebpackPlugin({
				patterns: [{ from: "src/server/questions_png", to: "assets" }],
				options: {
					concurrency: 1000,
				},
			}),
		],
	};
};