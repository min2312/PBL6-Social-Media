import adminService from "../service/adminService";
require("dotenv").config();
let HandleLoginAdmin = async (req, res) => {
	let email = req.body.email;
	let pass = req.body.password;
	if (!email || !pass) {
		return res.status(500).json({
			errcode: 1,
			message: "Missing inputs parameter!",
		});
	}

	let userdata = await adminService.HandleAdminLogin(email, pass);
	if (userdata && userdata.DT && userdata.DT.access_token) {
		res.cookie("jwt2", userdata.DT.access_token, {
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

const HandleLogOut = (req, res) => {
	try {
		res.clearCookie("jwt2");
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

const getAdminAccount = async (req, res) => {
	if (!req.admin) {
		return res.status(401).json({
			errCode: -1,
			errMessage: "Not Authenticated the admin",
		});
	}
	return res.status(200).json({
		errCode: 0,
		errMessage: "Ok!",
		DT: {
			access_token: req.adminToken,
			id: req.admin.id,
			fullName: req.admin.fullName,
			email: req.admin.email,
			role: req.admin.role,
		},
	});
};
module.exports = {
	HandleLoginAdmin: HandleLoginAdmin,
	HandleLogOut: HandleLogOut,
	getAdminAccount: getAdminAccount,
};
