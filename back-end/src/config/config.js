require("dotenv").config();
const fs = require("fs");
const path = require("path");
module.exports = {
	development: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "mysql",
		port: process.env.DB_PORT,
		dialectOptions: {
			ssl: {},
		},
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: "mysql",
		port: process.env.DB_PORT,
	},
};
