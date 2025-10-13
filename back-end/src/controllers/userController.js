import userService from "../service/userService";
// import apiService from "../service/apiService";
require("dotenv").config();
let HandleLogin = async (req, res) => {
	let email = req.body.email;
	let pass = req.body.password;
	if (!email || !pass) {
		return res.status(500).json({
			errcode: 1,
			message: "Missing inputs parameter!",
		});
	}

	let userdata = await userService.HandleUserLogin(email, pass);
	if (userdata && userdata.DT && userdata.DT.access_token) {
		res.cookie("jwt", userdata.DT.access_token, {
			httpOnly: true,
			maxAge: process.env.maxAgeCookie,
		});
	}
	return res.status(200).json({
		errcode: userdata.errCode,
		message: userdata.errMessage,
		user: userdata.user ? userdata.user : {},
		DT: userdata.DT,
	});
};

let HandleGetAllUser = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			user: [],
		});
	}
	let user = await userService.getAllUser(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		user: user,
	});
};
let HandleCreateNewUser = async (req, res) => {
	let message = await userService.CreateNewUser(req.body);
	return res.status(200).json(message);
};
let HandleEditUser = async (req, res) => {
	let data = req.body;
	let message = await userService.updateUser(data);
	if (message && message.DT && message.DT.access_token) {
		res.cookie("jwt", message.DT.access_token, {
			httpOnly: true,
			maxAge: 60 * 60 * 1000,
		});
	}
	return res.status(200).json(message);
};
// let HandleDeleteUser = async (req, res) => {
// 	if (!req.body.id) {
// 		return res.status(200).json({
// 			errCode: 1,
// 			errMessage: "Missing required parameters!",
// 		});
// 	}
// 	let car = await apiService.GetAllCar(`${req.body.id}`);
// 	car.forEach(async (cars) => {
// 		let ticket = await apiService.DeleteTicket(cars.id_car);
// 	});
// 	let result = await apiService.DeleteCar(req.body.id);
// 	let message = await userService.DeleteUser(req.body.id);
// 	return res.status(200).json({
// 		...message,
// 	});
// };
const getUserAccount = async (req, res) => {
	if (!req.user) {
		return res.status(401).json({
			errCode: -2,
			errMessage: "Not Authenticated the user",
		});
	}
	return res.status(200).json({
		errCode: 0,
		errMessage: "Ok!",
		DT: {
			access_token: req.token,
			id: req.user.id,
			fullName: req.user.fullName,
			email: req.user.email,
			createdAt: req.user.createdAt,
			bio: req.user.bio,
		},
	});
};
const HandleLogOut = (req, res) => {
	try {
		res.clearCookie("jwt");
		return res.status(200).json({
			errCode: 0,
			errMessage: "Clear cookie done",
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};
let HandleGetInfoCar = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			user: [],
		});
	}
	let user = await userService.getInfoCar(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		user: user,
	});
};

let HandleDeleteUser = async (req, res) => {
	if (!req.body.id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameters!",
		});
	}
	let message = await userService.DeleteUser(req.body.id);
	return res.status(200).json({
		...message,
	});
};

module.exports = {
	HandleLogin: HandleLogin,
	HandleGetAllUser: HandleGetAllUser,
	HandleCreateNewUser: HandleCreateNewUser,
	HandleEditUser: HandleEditUser,
	HandleDeleteUser: HandleDeleteUser,
	getUserAccount,
	HandleLogOut: HandleLogOut,
	HandleGetInfoCar: HandleGetInfoCar,
};
