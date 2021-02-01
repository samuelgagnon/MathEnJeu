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
		devServer: {
			inline: true,
			port: 8080,
			host: "0.0.0.0",
		},
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
			new webpack.DefinePlugin({
				"process.env": {
					PORT: JSON.stringify(process.env.PORT),
					DB_USER: JSON.stringify(process.env.DB_USER),
					DB_PWD: JSON.stringify(process.env.DB_PWD),
				},
			}),
		],
	};
};
