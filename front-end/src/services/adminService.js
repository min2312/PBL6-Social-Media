import axios from "../setup/axios";

const HandleAdminLogin = (data) => {
	return axios
		.post("/api/admin_login", data)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.error(error);
		});
};

const getAdminAccount = () => {
	return axios.get("/api/accountAdmin");
};
const LogOutAdmin = () => {
	return axios.post("/api/logoutAdmin");
};
export { HandleAdminLogin, getAdminAccount, LogOutAdmin };
