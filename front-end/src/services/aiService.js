import axios from "../setup/axios_AI";

const checkNSFWContent = (formData) => {
	return axios
		.post("/ai/predict", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log("NSFW Check Error:", err);
			throw err;
		});
};

export { checkNSFWContent };
