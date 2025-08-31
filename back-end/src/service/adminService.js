import { raw } from "mysql2";
import db from "../models/index";
import bcrypt from "bcryptjs";
import { where } from "sequelize";
import { response } from "express";
import { CreateJWT } from "../middleware/JWT_Action";
require("dotenv").config();

let HandleAdminLogin = (email, password) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userData = {};
			let isExist = await CheckAdminEmail(email);
			if (isExist) {
				let user = await db.Admin.findOne({
					where: { email: email },
					raw: true,
				});
				if (user) {
					let check = password === user.password;
					if (check) {
						let payload = {
							id: user.id,
							email: user.email,
							role: "admin",
						};
						let token = CreateJWT(payload);
						userData.errCode = 0;
						userData.errMessage = `OK`;
						delete user.password;
						userData.user = user;
						userData.DT = {
							access_token: token,
						};
					} else {
						userData.errCode = 3;
						userData.errMessage = `Yours's Email or Password is incorrect!`;
					}
				} else {
					userData.errCode = 2;
					userData.errMessage = `Admin's not found`;
				}
			} else {
				userData.errCode = 1;
				userData.errMessage = `Yours's Email or Password is incorrect!`;
			}
			resolve(userData);
		} catch (e) {
			reject(e);
		}
	});
};

let CheckAdminEmail = (userEmail) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.Admin.findOne({
				where: { email: userEmail },
			});
			if (user) {
				resolve(true);
			} else {
				resolve(false);
			}
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	HandleAdminLogin: HandleAdminLogin,
};
