import socialService from "../service/socialService.js";
const cloudinary = require("cloudinary").v2;

let HandleSearch = async (req, res) => {
	try {
		let query = req.query.q;
		let currentUserId = req.query.userId;
		let result = await socialService.Search(query, currentUserId);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			people: result.users,
			posts: result.posts,
		});
	} catch (error) {
		console.error("Error searching:", error);
		return res.status(500).json({ errCode: 1, errMessage: "Error searching" });
	}
};

let HandleGetAllFriendships = async (req, res) => {
	try {
		let userId = req.query.userId;
		if (!userId) {
			return res
				.status(400)
				.json({ errCode: 1, errMessage: "Missing userId parameter" });
		}
		let result = await socialService.getAllFriendships(userId);
		return res
			.status(200)
			.json({ errCode: 0, errMessage: "OK", friendships: result.data });
	} catch (error) {
		console.error("Error getting friendships:", error);
		return res
			.status(500)
			.json({ errCode: 1, errMessage: "Error getting friendships" });
	}
};

let HandleAddFriend = async (req, res) => {
	try {
		let { userId, friendId } = req.body;
		let result = await socialService.AddFriend(userId, friendId);
		return res
			.status(200)
			.json({ errCode: result.errCode, errMessage: result.errMessage });
	} catch (error) {
		console.error("Error adding friend:", error);
		return res
			.status(500)
			.json({ errCode: 1, errMessage: "Error adding friend" });
	}
};

let HandleSendFriendRequest = async (req, res) => {
	try {
		let { userId, friendId, status } = req.body;
		let result = await socialService.UpdateFriendshipStatus(
			userId,
			friendId,
			status
		);
		return res
			.status(200)
			.json({ errCode: result.errCode, errMessage: result.errMessage });
	} catch (error) {
		console.error("Error sending friend request:", error);
		return res
			.status(500)
			.json({ errCode: 1, errMessage: "Error sending friend request" });
	}
};
let HandleCancelFriendRequest = async (req, res) => {
	try {
		let { userId, friendId } = req.body;
		let result = await socialService.DeleteFriendship(userId, friendId);
		return res
			.status(200)
			.json({ errCode: result.errCode, errMessage: result.errMessage });
	} catch (error) {
		console.error("Error canceling friend request:", error);
		return res
			.status(500)
			.json({ errCode: 1, errMessage: "Error canceling friend request" });
	}
};

let handleGetMessages = async (req, res) => {
	try {
		const { userId1, userId2 } = req.query;
		if (!userId1 || !userId2) {
			return res
				.status(400)
				.json({ errCode: 1, errMessage: "Missing user IDs" });
		}
		const messages = await socialService.getMessages(userId1, userId2);
		return res.status(200).json({ errCode: 0, messages });
	} catch (error) {
		console.error("Error getting messages:", error);
		return res
			.status(500)
			.json({ errCode: 1, errMessage: "Error getting messages" });
	}
};

module.exports = {
	HandleSearch,
	HandleAddFriend,
	HandleSendFriendRequest,
	HandleCancelFriendRequest,
	HandleGetAllFriendships,
	handleGetMessages,
};
