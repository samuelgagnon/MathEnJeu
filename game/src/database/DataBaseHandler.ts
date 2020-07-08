import { Connection } from "mysql";

export default class DataBaseHandler {
	private mysql = require("mysql");
	private host: string = "127.0.0.1";
	private user: string = "root";
	private password: string = "";
	private database: string = "mathenjeudb";
	private port: number = 3306;

	constructor(host: string, user: string, password: string, database: string, port: number) {
		this.host = host;
		this.user = user;
		this.password = password;
		this.database = database;
		this.port = port;
	}

	getFirstQuestion(): void {
		let connection: Connection = this.mysql.createConnection({
			host: this.host,
			user: this.user,
			password: this.password,
			database: this.database,
			port: this.port,
		});

		connection.connect(function (err) {
			if (err) {
				console.error("error connecting: " + err.stack);
				return;
			}
			console.log("connected as id " + connection.threadId);
			connection.query("SELECT TOP 1 * FROM question", (err, result, fields) => {
				if (err) throw err;
				console.log(result);
			});
		});
	}
}
