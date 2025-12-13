import { raw } from "mysql2";
import db, { Sequelize } from "../models/index";
import { Op, where } from "sequelize";
import { response } from "express";
import { getAllUser } from "../service/userService";
import { resolve } from "path";
import { rejects } from "assert";
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

let CreateComment = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Post.findOne({
				where: { id: data.postId },
			});
			if (!check) {
				resolve({
					errCode: 1,
					errMessage: "Post not found",
				});
				return;
			}
			let newComment = await db.Comment.create({
				userId: data.userId,
				postId: data.postId,
				content: data.content,
			});
			// Create notification if commenter is not the post owner
			try {
				const postOwnerId = check.userId;
				if (postOwnerId && Number(postOwnerId) !== Number(data.userId)) {
					const sender = await db.User.findByPk(data.userId, {
						attributes: ["fullName"],
					});
					await db.Notification.create({
						receiverId: postOwnerId,
						senderId: data.userId,
						title: `New comment ${newComment.id}`,
						content: `${sender?.fullName || "Someone"} commented: ${String(
							data.content || ""
						).slice(0, 100)}`,
						url: `/post/${data.postId}`,
						type: "COMMENT",
						isRead: false,
					});
				}
			} catch (notifyErr) {
				console.warn("CreateComment notification failed:", notifyErr);
			}

			let findNewComment = await db.Comment.findOne({
				where: { id: newComment.id },
				include: [
					{
						model: db.User,
						attributes: ["id", "fullName", "profilePicture"],
					},
				],
			});
			resolve({
				errCode: 0,
				errMessage: "Create comment successfully",
				comment: findNewComment,
			});
		} catch (e) {
			reject({
				errCode: 1,
				errMessage: "Error creating comment",
			});
		}
	});
};

let CreatePost = (data, fileImages, fileVideos = []) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!data) {
				if (fileImages && fileImages.length > 0) {
					await Promise.all(
						fileImages.map((file) => cloudinary.uploader.destroy(file.filename))
					);
				}
				return resolve({
					errCode: 1,
					errMessage: "The post error",
				});
			} else {
				let imagePath = null;
				if (Array.isArray(data.image) && data.image.length > 0) {
					imagePath = data.image; // mảng ảnh từ Cloudinary
				} else if (fileImages && fileImages.length > 0) {
					imagePath = fileImages.map((f) => f.path);
				}
				// Derive videoUrl from uploaded video file
				let videoUrl = null;
				if (Array.isArray(fileVideos) && fileVideos.length > 0) {
					const v = fileVideos[0];
					videoUrl = v?.path || null;
				} else if (typeof data.videoUrl === "string" && data.videoUrl) {
					// In case client sent an existing video URL
					videoUrl = data.videoUrl;
				}
				let newPost = await db.Post.create({
					userId: Number(data.userId),
					content: data.content,
					videoUrl,
					imageUrl: Array.isArray(imagePath)
						? JSON.stringify(imagePath)
						: imagePath,
				});
				newPost = await db.Post.findOne({
					where: { id: newPost.id },
					include: [
						{
							model: db.User,
							attributes: ["id", "fullName", "email", "profilePicture"],
						},
					],
				});
				resolve({
					errCode: 0,
					errMessage: "Create new post successfully",
					post: newPost,
				});
			}
		} catch (e) {
			console.log(e);
			if (fileImages && fileImages.length > 0) {
				await Promise.all(
					fileImages.map((file) => cloudinary.uploader.destroy(file.filename))
				);
			}
			reject({
				errCode: 1,
				errMessage: "Error creating post",
			});
		}
	});
};

let EditPost = (data, fileImage, fileVideos = []) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Post.findOne({
				where: { id: data.id },
			});
			if (check) {
				let oldImages = Array.isArray(check.imageUrl)
					? check.imageUrl
					: JSON.parse(check.imageUrl || "[]");
				let newImages = [];
				if (Array.isArray(data.image) && data.image.length > 0) {
					newImages = data.image; // mảng ảnh từ Cloudinary
				} else if (fileImage && fileImage.length > 0) {
					newImages = fileImage.map((f) => f.path);
				}
				if (
					Array.isArray(data.existingImages) &&
					data.existingImages.length > 0
				) {
					const existing = data.existingImages.map((img) => img.trim());
					newImages = [...existing, ...newImages];
				} else if (data.existingImages) {
					newImages = [data.existingImages, ...newImages];
				}
				let removedImages = oldImages.filter((url) => !newImages.includes(url));
				for (const imgUrl of removedImages) {
					try {
						const uploadPart = imgUrl.split("/upload/")[1];
						let parts = uploadPart.split("/");
						if (parts[0].startsWith("v")) parts.shift();
						const publicId = parts.join("/").split(".")[0];
						await cloudinary.uploader.destroy(publicId);
					} catch (err) {
						console.warn("Failed to delete old image:", imgUrl);
					}
				}
				newImages = newImages.filter(
					(img) => img && img !== "null" && img.trim() !== ""
				);
				const finalImageValue =
					newImages.length > 0 ? JSON.stringify(newImages) : null;
				// Handle replacing/removing old video if needed
				try {
					// incoming from uploaded files or data.videoUrl
					const incomingVideo =
						Array.isArray(fileVideos) && fileVideos.length > 0
							? fileVideos[0]?.path || null
							: data.videoUrl || null;
					const existingVideo = check.videoUrl;
					const shouldRemoveOld =
						(existingVideo &&
							(incomingVideo === null || incomingVideo === "")) ||
						(existingVideo && incomingVideo && incomingVideo !== existingVideo);
					if (shouldRemoveOld) {
						const uploadPart = existingVideo.split("/upload/")[1];
						if (uploadPart) {
							let parts = uploadPart.split("/");
							if (parts[0].startsWith("v")) parts.shift();
							const publicId = parts.join("/").split(".")[0];
							await cloudinary.uploader.destroy(publicId, {
								resource_type: "video",
							});
						}
					}
				} catch (err) {
					console.warn("Failed to delete old video:", err?.message || err);
				}

				await check.update({
					content:
						data.content === null || data.content === "" ? null : data.content,
					videoUrl:
						Array.isArray(fileVideos) && fileVideos.length > 0
							? fileVideos[0]?.path || null
							: data.videoUrl === null || data.videoUrl === ""
							? null
							: data.videoUrl,
					imageUrl: finalImageValue,
				});
				resolve({
					errCode: 0,
					errMessage: "Update post successfully",
					post: check,
				});
			} else {
				if (fileImage && fileImage.length > 0) {
					await Promise.all(
						fileImage.map((file) => cloudinary.uploader.destroy(file.filename))
					);
				}
				resolve({
					errCode: 1,
					errMessage: "The post not found",
				});
			}
		} catch (e) {
			console.log(e);
			if (fileImage && fileImage.length > 0) {
				await Promise.all(
					fileImage.map((file) => cloudinary.uploader.destroy(file.filename))
				);
			}
			reject({
				errCode: 1,
				errMessage: "The post error",
			});
		}
	});
};

let DeletePost = (postId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Post.findOne({
				where: { id: postId },
			});
			if (check) {
				let imageArray = [];
				if (check.imageUrl) {
					imageArray = Array.isArray(check.imageUrl)
						? check.imageUrl
						: typeof check.imageUrl === "string"
						? JSON.parse(check.imageUrl) // nếu trong DB lưu chuỗi JSON
						: [];
				}
				// Lặp qua từng ảnh và xóa trên Cloudinary
				for (const imgUrl of imageArray) {
					try {
						const uploadPart = imgUrl.split("/upload/")[1];
						if (!uploadPart) continue;

						let parts = uploadPart.split("/");
						if (parts[0].startsWith("v")) parts.shift();

						const publicId = parts.join("/").split(".")[0];
						await cloudinary.uploader.destroy(publicId);
						console.log("🗑️ Deleted:", publicId);
					} catch (err) {
						console.error("❌ Error deleting image:", imgUrl, err);
					}
				}
				// Delete video on Cloudinary if exists
				try {
					if (check.videoUrl) {
						const uploadPart = check.videoUrl.split("/upload/")[1];
						if (uploadPart) {
							let parts = uploadPart.split("/");
							if (parts[0].startsWith("v")) parts.shift();
							const publicId = parts.join("/").split(".")[0];
							await cloudinary.uploader.destroy(publicId, {
								resource_type: "video",
							});
						}
					}
				} catch (err) {
					console.error("❌ Error deleting video:", check.videoUrl, err);
				}

				await db.Post.destroy({
					where: { id: postId },
				});
				resolve({
					errCode: 0,
					errMessage: "Delete post successfully",
				});
			} else {
				resolve({
					errCode: 1,
					errMessage: "Post not found",
				});
			}
		} catch (e) {
			console.log(e);
			reject({
				errCode: 1,
				errMessage: "Error deleting dish",
			});
		}
	});
};

let GetAllPost = (postId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let posts = "";
			if (postId === "ALL") {
				posts = await db.Post.findAll({
					where: {
						isDeleted: false,
					},
					include: [
						{
							model: db.User,
							attributes: ["id", "fullName", "email", "profilePicture"],
						},
					],
					order: [["createdAt", "DESC"]],
				});
			}
			if (postId && postId !== "ALL") {
				posts = await db.Post.findAll({
					where: { userId: postId },
					include: [
						{
							model: db.User,
							attributes: [
								"id",
								"fullName",
								"email",
								"profilePicture",
								"createdAt",
							],
						},
					],
					order: [["createdAt", "DESC"]],
				});
			}
			const formattedPosts = posts.map((p) => {
				let images = [];
				try {
					if (typeof p.imageUrl === "string") {
						images = JSON.parse(p.imageUrl);
					} else if (Array.isArray(p.imageUrl)) {
						images = p.imageUrl;
					}
				} catch (err) {
					console.warn("Invalid imageUrl JSON:", p.imageUrl);
				}

				return {
					...p.toJSON(),
					imageUrl: images,
				};
			});
			resolve(formattedPosts);
		} catch (e) {
			reject(e);
		}
	});
};

let GetComment = (postId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let comments = await db.Comment.findAll({
				where: { postId: postId },
				include: [
					{
						model: db.User,
						attributes: ["id", "fullName", "profilePicture"],
					},
				],
			});
			resolve(comments);
		} catch (e) {
			reject(e);
		}
	});
};

let CreateLike = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await db.Like.findOne({
				where: { userId: data.userId, postId: data.postId },
			});
			if (check) {
				await db.Like.destroy({
					where: { userId: data.userId, postId: data.postId },
				});
				// Remove like notification (if any)
				try {
					const post = await db.Post.findOne({
						where: { id: data.postId },
						attributes: ["userId"],
					});
					const postOwnerId = post?.userId;
					if (postOwnerId && Number(postOwnerId) !== Number(data.userId)) {
						await db.Notification.destroy({
							where: {
								receiverId: postOwnerId,
								senderId: data.userId,
								type: "LIKE",
								url: `/post/${data.postId}`,
							},
						});
					}
				} catch (notifyErr) {
					console.warn("Delete like notification failed:", notifyErr);
				}
				resolve({
					errCode: 0,
					errMessage: "Unliked the post successfully",
				});
			} else {
				await db.Like.create({
					userId: data.userId,
					postId: data.postId,
				});

				// Create notification if liker is not the post owner
				try {
					const post = await db.Post.findOne({ where: { id: data.postId } });
					const postOwnerId = post?.userId;
					if (postOwnerId && Number(postOwnerId) !== Number(data.userId)) {
						const sender = await db.User.findByPk(data.userId, {
							attributes: ["fullName"],
						});
						await db.Notification.create({
							receiverId: postOwnerId,
							senderId: data.userId,
							title: "New like",
							content: `${sender?.fullName || "Someone"} liked your post`,
							url: `/post/${data.postId}`,
							type: "LIKE",
							isRead: false,
						});
					}
				} catch (notifyErr) {
					console.warn("CreateLike notification failed:", notifyErr);
				}

				resolve({
					errCode: 0,
					errMessage: "Liked the post successfully",
				});
			}
		} catch (e) {
			console.log(e);
			reject({
				errCode: 1,
				errMessage: "Error liking/unliking the post",
			});
		}
	});
};

let GetLike = (postId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let likes = await db.Like.findAll({
				where: { postId: postId },
			});
			resolve(likes);
		} catch (e) {
			reject(e);
		}
	});
};

// New: count unread notifications
let GetNotificationUnreadCount = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const count = await db.Notification.count({
				where: { receiverId: userId, isRead: false },
			});
			resolve(count);
		} catch (e) {
			reject(e);
		}
	});
};

let UpdateComment = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			// data: { id, content, userId? }
			if (!data?.id || typeof data.content !== "string") {
				return resolve({
					errCode: 1,
					errMessage: "Missing required fields",
				});
			}
			let comment = await db.Comment.findOne({
				where: { id: data.id },
			});
			if (!comment) {
				return resolve({
					errCode: 1,
					errMessage: "Comment not found",
				});
			}
			// Optional: ownership check if userId provided
			if (data.userId && Number(comment.userId) !== Number(data.userId)) {
				return resolve({
					errCode: 1,
					errMessage: "Not authorized to edit this comment",
				});
			}

			await comment.update({ content: data.content });

			// Return updated comment with user info
			const updated = await db.Comment.findOne({
				where: { id: comment.id },
				include: [
					{
						model: db.User,
						attributes: ["id", "fullName", "profilePicture"],
					},
				],
			});

			return resolve({
				errCode: 0,
				errMessage: "Update comment successfully",
				comment: updated,
			});
		} catch (e) {
			console.log(e);
			return reject({
				errCode: 1,
				errMessage: "Error updating comment",
			});
		}
	});
};

let DeleteComment = (commentId, userId = null) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!commentId) {
				return resolve({
					errCode: 1,
					errMessage: "Missing comment id",
				});
			}
			let comment = await db.Comment.findOne({
				where: { id: commentId },
			});
			if (!comment) {
				return resolve({
					errCode: 1,
					errMessage: "Comment not found",
				});
			}
			// Optional: ownership check if userId provided
			if (userId && Number(comment.userId) !== Number(userId)) {
				return resolve({
					errCode: 1,
					errMessage: "Not authorized to delete this comment",
				});
			}

			// Remove specific comment notification by title with comment ID
			try {
				const post = await db.Post.findOne({
					where: { id: comment.postId },
					attributes: ["userId"],
				});
				const postOwnerId = post?.userId;
				if (postOwnerId && Number(postOwnerId) !== Number(comment.userId)) {
					await db.Notification.destroy({
						where: {
							receiverId: postOwnerId,
							senderId: comment.userId,
							type: "COMMENT",
							title: `New comment ${commentId}`,
							url: `/post/${comment.postId}`,
						},
					});
				}
			} catch (notifyErr) {
				console.warn("Delete comment notification failed:", notifyErr);
			}

			await comment.destroy();

			return resolve({
				errCode: 0,
				errMessage: "Delete comment successfully",
			});
		} catch (e) {
			console.log(e);
			return reject({
				errCode: 1,
				errMessage: "Error deleting comment",
			});
		}
	});
};

let GetNotificationsByUserId = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const notifications = await db.Notification.findAll({
				where: { receiverId: userId },
				include: [
					{
						model: db.User,
						as: "sender",
						attributes: ["id", "fullName", "profilePicture"],
					},
				],
				order: [["createdAt", "DESC"]],
			});
			resolve(notifications);
		} catch (e) {
			reject(e);
		}
	});
};

let GetPostByPostId = (postId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!postId) {
				return resolve({
					errCode: 1,
					errMessage: "Missing post ID",
				});
			}

			let post = await db.Post.findOne({
				where: {
					id: postId,
					isDeleted: false,
				},
				include: [
					{
						model: db.User,
						attributes: ["id", "fullName", "email", "profilePicture"],
					},
					{
						model: db.Comment,
						include: [
							{
								model: db.User,
								attributes: ["id", "fullName", "profilePicture"],
							},
						],
						order: [["createdAt", "ASC"]],
					},
					{
						model: db.Like,
					},
				],
			});

			if (!post) {
				return resolve({
					errCode: 1,
					errMessage: "Post not found",
				});
			}

			// Format images
			let images = [];
			try {
				if (typeof post.imageUrl === "string") {
					images = JSON.parse(post.imageUrl);
				} else if (Array.isArray(post.imageUrl)) {
					images = post.imageUrl;
				}
			} catch (err) {
				console.warn("Invalid imageUrl JSON:", post.imageUrl);
			}

			const formattedPost = {
				...post.toJSON(),
				imageUrl: images,
				likesCount: post.Likes ? post.Likes.length : 0,
				commentsCount: post.Comments ? post.Comments.length : 0,
			};

			resolve({
				errCode: 0,
				errMessage: "Get post successfully",
				post: formattedPost,
			});
		} catch (e) {
			console.log(e);
			reject({
				errCode: 1,
				errMessage: "Error getting post",
			});
		}
	});
};

let UpdateNotificationReadStatus = (notificationId, isRead = true) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!notificationId) {
				return resolve({
					errCode: 1,
					errMessage: "Missing notification ID",
				});
			}

			let notification = await db.Notification.findOne({
				where: { id: notificationId },
			});

			if (!notification) {
				return resolve({
					errCode: 1,
					errMessage: "Notification not found",
				});
			}

			await notification.update({ isRead: isRead });

			return resolve({
				errCode: 0,
				errMessage: "Update notification read status successfully",
				notification: notification,
			});
		} catch (e) {
			console.log(e);
			return reject({
				errCode: 1,
				errMessage: "Error updating notification read status",
			});
		}
	});
};

module.exports = {
	GetAllPost,
	GetComment,
	CreateLike,
	GetLike,
	CreateComment,
	CreatePost,
	EditPost,
	DeletePost,
	GetNotificationsByUserId,
	GetNotificationUnreadCount,
	UpdateComment,
	DeleteComment,
	GetPostByPostId,
	UpdateNotificationReadStatus,
};
