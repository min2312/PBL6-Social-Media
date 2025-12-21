import { or } from "sequelize";
import apiService from "../service/apiService";
import { CreateJWT } from "../middleware/JWT_Action";
import db from "../models/index";
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

let handlePaymentZaloPay = async (req, res) => {
	try {
		const paymentResult = await apiService.createZaloPayOrder(req.body);
		return res.status(200).json(paymentResult);
	} catch (error) {
		console.error("ZaloPay error:", error);
		// Check if it's the active premium error
		if (
			error.message &&
			error.message.includes("active Premium subscription")
		) {
			return res.status(400).json({
				errCode: 1,
				errMessage: error.message,
			});
		}
		return res.status(500).json({
			message: "An error occurred during ZaloPay processing",
			error: error.message,
		});
	}
};

let handleCheckZaloPay = async (req, res) => {
	try {
		const { app_trans_id } = req.body;
		const paymentResult = await apiService.checkZaloPayOrderStatus(
			app_trans_id
		);

		// If payment successful and it was premium, return new JWT token
		if (paymentResult.return_code === 1) {
			const payment = await db.Payment.findOne({
				where: { appTransId: app_trans_id },
			});
			if (payment && payment.paymentType === "premium") {
				const user = await db.User.findByPk(payment.userId, {
					attributes: { exclude: ["passwordHash"] },
				});
				if (user) {
					const payload = {
						id: user.id,
						email: user.email,
						fullName: user.fullName,
						profilePicture: user.profilePicture,
						role: user.role,
						isPremium: user.isPremium,
						premiumExpiresAt: user.premiumExpiresAt,
					};
					const newToken = CreateJWT(payload);
					// Set cookie
					res.cookie("jwt", newToken, {
						httpOnly: true,
						maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
						samesite: "none",
						secure: true,
					});
					return res
						.status(200)
						.json({ ...paymentResult, token: newToken, user: payload });
				}
			}
		}

		return res.status(200).json(paymentResult);
	} catch (error) {
		console.error("ZaloPay error:", error);
		return res.status(500).json({
			message: "An error occurred during ZaloPay processing",
			error: error.message,
		});
	}
};

let handleCallBackZaloPay = async (req, res) => {
	try {
		const paymentResult = await apiService.callbackZaloPayOrder(req.body);
		return res.status(200).json(paymentResult);
	} catch (error) {
		console.error("ZaloPay error:", error);
		return res.status(500).json({
			message: "An error occurred during ZaloPay processing",
			error: error.message,
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
	handlePaymentZaloPay,
	handleCheckZaloPay,
	handleCallBackZaloPay,
};
