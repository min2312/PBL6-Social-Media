import { or } from "sequelize";
import apiService from "../service/apiService";
const cloudinary = require("cloudinary").v2;

let HandleCreatePost = async (req, res) => {
	let data = req.body || {};
	// Support both array upload and fields upload
	const files = req.files || {};
	const fileImages = Array.isArray(files) ? files : files.image || [];
	const fileVideos = Array.isArray(files) ? [] : files.video || [];
	if (!data || Object.keys(data).length === 0) {
		if (fileImages && fileImages.length) {
			for (const fileImage of fileImages) {
				await cloudinary.uploader.destroy(fileImage.filename);
			}
		}
		if (fileVideos && fileVideos.length) {
			for (const fileVideo of fileVideos) {
				await cloudinary.uploader.destroy(fileVideo.filename, {
					resource_type: "video",
				});
			}
		}
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}

	try {
		// Delegate video handling to service; controller stays thin
		let result = await apiService.CreatePost(data, fileImages, fileVideos);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
			post: result.post,
			violenceDetails: result.violenceDetails, // Pass through violence detection details
		});
	} catch (error) {
		if (fileImages && fileImages.length) {
			for (const fileImage of fileImages) {
				await cloudinary.uploader.destroy(fileImage.filename);
			}
		}
		if (fileVideos && fileVideos.length) {
			for (const fileVideo of fileVideos) {
				await cloudinary.uploader.destroy(fileVideo.filename, {
					resource_type: "video",
				});
			}
		}
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error creating post",
		});
	}
};

let HandleEditPost = async (req, res) => {
	let data = req.body || {};
	const files = req.files || {};
	const fileImages = Array.isArray(files) ? files : files.image || [];
	const fileVideos = Array.isArray(files) ? [] : files.video || [];
	if (!data || Object.keys(data).length === 0) {
		if (fileImages && fileImages.length) {
			for (const fileImage of fileImages) {
				await cloudinary.uploader.destroy(fileImage.filename);
			}
		}
		if (fileVideos && fileVideos.length) {
			for (const fileVideo of fileVideos) {
				await cloudinary.uploader.destroy(fileVideo.filename, {
					resource_type: "video",
				});
			}
		}
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	try {
		// Delegate video handling to service
		let result = await apiService.EditPost(data, fileImages, fileVideos);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
			post: result.post,
			violenceDetails: result.violenceDetails, // Pass through violence detection details
		});
	} catch (error) {
		if (fileImages && fileImages.length) {
			for (const fileImage of fileImages) {
				await cloudinary.uploader.destroy(fileImage.filename);
			}
		}
		if (fileVideos && fileVideos.length) {
			for (const fileVideo of fileVideos) {
				await cloudinary.uploader.destroy(fileVideo.filename, {
					resource_type: "video",
				});
			}
		}
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error creating post",
		});
	}
};

let HandleDeletePost = async (req, res) => {
	let id = req.body.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.DeletePost(id);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
	});
};

let HandleGetAllPost = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			post: [],
		});
	}
	let posts = await apiService.GetAllPost(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		post: posts,
	});
};

let HandleGetAllComment = async (req, res) => {
	let postId = req.query.postId;
	if (!postId) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			comments: [],
		});
	}
	let comments = await apiService.GetComment(postId);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		comments: comments,
	});
};

let HandleLikePost = async (req, res) => {
	let data = req.body;
	if (!data) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.CreateLike(data);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
	});
};

let HandleGetLike = async (req, res) => {
	let postId = req.query.postId;
	if (!postId) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			likes: [],
		});
	}
	let likes = await apiService.GetLike(postId);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		likes: likes,
	});
};

let HandleCreateComment = async (req, res) => {
	let data = req.body;
	if (!data) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	let result = await apiService.CreateComment(data);
	return res.status(200).json({
		errCode: result.errCode,
		errMessage: result.errMessage,
		comment: result.comment,
	});
};

let HandleUpdateComment = async (req, res) => {
	const data = req.body;
	if (!data || !data.id || typeof data.content !== "string") {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	try {
		const result = await apiService.UpdateComment(data);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
			comment: result.comment,
		});
	} catch (e) {
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error updating comment",
		});
	}
};

let HandleDeleteComment = async (req, res) => {
	const { id, userId } = req.body || {};
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	try {
		const result = await apiService.DeleteComment(id, userId);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
		});
	} catch (e) {
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error deleting comment",
		});
	}
};

let HandleGetNotificationsByUserId = async (req, res) => {
	let userId = req.query.userId;
	if (!userId) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			notifications: [],
			unread: 0,
		});
	}
	try {
		let notifications = await apiService.GetNotificationsByUserId(userId);
		let unread = await apiService.GetNotificationUnreadCount(userId);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			notifications: notifications,
			unread: unread,
		});
	} catch (e) {
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error fetching notifications",
			notifications: [],
			unread: 0,
		});
	}
};

let HandleGetPostByPostId = async (req, res) => {
	let postId = req.query.postId || req.params.postId;
	if (!postId) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	try {
		let result = await apiService.GetPostByPostId(postId);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
			post: result.post,
		});
	} catch (e) {
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error getting post",
		});
	}
};

let HandleGetLikedPostsByUserId = async (req, res) => {
	let userId = req.query.userId;
	if (!userId) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			posts: [],
		});
	}
	try {
		let posts = await apiService.GetLikedPostsByUserId(userId);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			posts: posts,
		});
	} catch (e) {
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error fetching liked posts",
			posts: [],
		});
	}
};

let HandleUpdateNotificationReadStatus = async (req, res) => {
	const { id, isRead } = req.body;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
		});
	}
	try {
		const result = await apiService.UpdateNotificationReadStatus(id, isRead);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
			notification: result.notification,
		});
	} catch (e) {
		return res.status(500).json({
			errCode: 1,
			errMessage: "Error updating notification read status",
		});
	}
};

module.exports = {
	HandleCreatePost,
	HandleLikePost,
	HandleGetLike,
	HandleEditPost,
	HandleDeletePost,
	HandleGetAllPost,
	HandleGetAllComment,
	HandleCreateComment,
	HandleGetNotificationsByUserId,
	HandleUpdateComment,
	HandleDeleteComment,
	HandleGetPostByPostId,
	HandleUpdateNotificationReadStatus,
	HandleGetLikedPostsByUserId,
};
