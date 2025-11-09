import React, { useState, useRef, useEffect, useContext } from "react";
import {
	MoreHorizontal,
	ThumbsUp,
	MessageSquare,
	Share,
	Send,
	Edit,
	Trash2,
} from "lucide-react";
import "./Post.css";
import useSmartRelativeTime from "../../hook/useSmartRelativeTime";
import EditPost from "../EditPost/EditPost";
import DeletePost from "../DeletePost/DeletePost";
import { UserContext } from "../../Context/UserProvider";
import {
	CreateComment,
	CreateLike,
	DeletePostConfirm,
	GetAllComment,
	UpdateComment,
	DeleteComment
} from "../../services/apiService";
import { checkToxicComment } from "../../services/aiService";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const Post = ({ post, onUpdatePost, onDeletePost }) => {
	const [isLiked, setIsLiked] = useState(false);
	const [showComments, setShowComments] = useState(post.comments.length > 0);
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState(post.comments || []);
	const [socket, setSocket] = useState(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isCheckingToxic, setIsCheckingToxic] = useState(false);
	const [showToxicModal, setShowToxicModal] = useState(false);
	const [toxicResult, setToxicResult] = useState(null);
	const [activeCommentMenu, setActiveCommentMenu] = useState(null);
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editedCommentText, setEditedCommentText] = useState("");
	const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState(null);
	const dropdownRef = useRef(null);
	const { user } = useContext(UserContext);
	const formattedTime = useSmartRelativeTime(
		post.timestamp,
		post.formatTimeAgo
	);
	const formattedPostTime = useSmartRelativeTime(
		post.comments.timestamp,
		post.formatTimeAgo
	);
	useEffect(() => {
		if (!user || !user.token) {
			return;
		}

		const newSocket = io(`${process.env.REACT_APP_API_URL}`, {
			extraHeaders: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		newSocket.on("connect", () => {});

		newSocket.on("postUpdated", (updatedPost) => {
			console.log("updatedPost:", updatedPost);
			console.log("Received postUpdated event:", updatedPost.comments);
			if (
				updatedPost.comments &&
				updatedPost.comments.length > 0 &&
				updatedPost.id === post.id &&
				updatedPost.comments[0].User.id !== user.account.id
			) {
				const commentTimestamp = post.formatTimeAgo(
					updatedPost.comments[0].updatedAt
				);
				const newComment = {
					...updatedPost.comments[0],
					timestamp: commentTimestamp,
				};
				setComments((prev) => [...prev, newComment]);
			}
		});

		newSocket.on("connect_error", (err) => {
			console.error("Connection error:", err.message);
		});

		newSocket.on("disconnect", (reason) => {
			console.warn("WebSocket disconnected:", reason);
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [user]);
	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
			// Close comment menus if clicking outside any menu
			if (!event.target.closest(".comment-menu-wrapper")) {
				setActiveCommentMenu(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		setIsLiked(post.islikedbyUser);
	}, [post.islikedbyUser]);

	const handleLike = async () => {
		let res = await CreateLike({
			userId: user.account.id,
			postId: post.id,
		});
		if (res && res.errCode === 0) {
			setIsLiked(!isLiked);
			const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
			onUpdatePost({ ...post, likes: newLikes });
		}
	};
	const handleAddComment = async () => {
		if (!commentText.trim()) return;
		setIsCheckingToxic(true);
		let toxicRes;
		try {
			toxicRes = await checkToxicComment(commentText);
		} catch (e) {
			console.error("Toxic check error:", e);
		}
		const isToxic =
			(toxicRes?.label && toxicRes.label !== 0);
		if (isToxic) {
			setToxicResult(toxicRes);
			setShowToxicModal(true);
			setIsCheckingToxic(false);
			return;
		}
		const cmt = {
			userId: user.account.id,
			content: commentText,
			postId: post.id,
		};
		let response = await CreateComment(cmt);
		const commentTimestamp = post.formatTimeAgo(response.comment.updatedAt);
		const newComment = {
			...response.comment,
			timestamp: commentTimestamp,
		};
		setComments((prev) => [...prev, newComment]);
		setCommentText("");
		onUpdatePost({ ...post, comments: [newComment] });
		setIsCheckingToxic(false);
	};
	const HandleGetComment = async () => {
		let resCmt = await GetAllComment(post.id);
		if (resCmt && resCmt.errCode === 0) {
			const formattedComments = resCmt.comments.map((comment) => ({
				...comment,
				timestamp: post.formatTimeAgo(comment.updatedAt),
			}));
			setComments(formattedComments);
		}
	};
	useEffect(() => {
		HandleGetComment();
	}, []);

	const handleShare = () => {
		onUpdatePost({ ...post, shares: post.shares + 1 });
	};

	const handleEditPost = () => {
		setShowDropdown(false);
		setIsEditModalOpen(true);
	};

	const handleDeletePost = () => {
		setShowDropdown(false);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async (postToDelete) => {
		let response = await DeletePostConfirm(postToDelete.id);
		if (response && response.errCode === 0) {
			onDeletePost(postToDelete);
			toast.success("Post deleted successfully!");
		} else {
			toast.error(response.errMessage || "Failed to delete post.");
		}
	};

	const toggleDropdown = (e) => {
		e.stopPropagation();
		setShowDropdown(!showDropdown);
	};

	const handleSaveEditedComment = async () => {
		if (!editedCommentText.trim()) return;
		setIsCheckingToxic(true);
		let toxicRes;
		try {
			toxicRes = await checkToxicComment(editedCommentText);
		} catch (e) {
			console.error("Toxic check error (edit):", e);
		}
		const isToxic = (toxicRes?.label && toxicRes.label !== 0);
		if (isToxic) {
			setToxicResult(toxicRes);
			setShowToxicModal(true);
			setIsCheckingToxic(false);
			return;
		}
		try {
			const res = await UpdateComment({
				id: editingCommentId,
				content: editedCommentText,
				userId: user.account.id,
			});
			if (res && res.errCode === 0) {
				const updated = res.comment;
				const commentTimestamp = post.formatTimeAgo(updated.updatedAt);
				setComments(prev =>
					prev.map(c =>
						c.id === editingCommentId
							? { ...updated, timestamp: commentTimestamp }
							: c
					)
				);
				toast.success("Comment updated");
			} else {
				toast.error(res?.errMessage || "Update failed");
			}
		} catch (e) {
			console.error("Update comment error:", e);
			toast.error("Update failed");
		} finally {
			setEditingCommentId(null);
			setEditedCommentText("");
			setIsCheckingToxic(false);
		}
	};

	const handleCancelEdit = () => {
		setEditingCommentId(null);
		setEditedCommentText("");
	};

	// Open delete confirmation modal instead of deleting immediately
	const handleDeleteComment = (comment) => {
		setActiveCommentMenu(null);
		setCommentToDelete(comment);
		setShowDeleteCommentModal(true);
	};

	const confirmDeleteComment = async () => {
		if (!commentToDelete) return;
		try {
			const res = await DeleteComment(commentToDelete.id);
			if (res && res.errCode === 0) {
				setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id));
				toast.success("Comment deleted");
			} else {
				toast.error(res?.errMessage || "Delete failed");
			}
		} catch (e) {
			console.error("Delete comment error:", e);
			toast.error("Delete failed");
		} finally {
			setShowDeleteCommentModal(false);
			setCommentToDelete(null);
		}
	};

	const cancelDeleteComment = () => {
		setShowDeleteCommentModal(false);
		setCommentToDelete(null);
	};

	return (
		<div className="post-card">
			{/* Post Header */}
			<div className="post-header">
				<div className="post-user-info">
					<div className="post-user-avatar">
						{post.User?.profilePicture && (
							<img
								src={post.User.profilePicture}
								alt="avatar"
								style={{ width: 40, height: 40, borderRadius: "50%" }}
							/>
						)}
					</div>
					<div className="post-user-details">
						<p className="user-name">{post.User?.fullName}</p>
						<p className="user-username">{post.User?.username}</p>
					</div>
				</div>
				<div className="post-meta">
					<span className="post-timestamp">{formattedTime}</span>
					{user?.account?.id === post.User?.id && (
						<div className="post-menu-wrapper" ref={dropdownRef}>
							<button className="post-menu-btn" onClick={toggleDropdown}>
								<MoreHorizontal size={16} />
							</button>
							{showDropdown && (
								<div className="post-dropdown-menu">
									<button className="dropdown-item" onClick={handleEditPost}>
										<Edit size={16} />
										<span>Edit Post</span>
									</button>
									<button
										className="dropdown-item delete-item"
										onClick={handleDeletePost}
									>
										<Trash2 size={16} />
										<span>Delete Post</span>
									</button>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Post Content */}
			<p className="post-content">{post.content}</p>

			{/* Post Images */}
			{post.images && post.images.length > 0 && (
				<div className="post-images">
					{post.images.map((image, index) => (
						<div key={index} className="post-image">
							<img
								src={image}
								alt="post"
								style={{ width: "100%", height: "auto", borderRadius: 8 }}
							/>
						</div>
					))}
				</div>
			)}

			{/* Post Actions */}
			<div className="post-actions-bar">
				<div className="post-actions-left">
					<button
						className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
						onClick={handleLike}
					>
						<ThumbsUp size={18} />
						<span>{post.likes}</span>
					</button>
					<button
						className="action-btn comment-btn"
						onClick={() => setShowComments(!showComments)}
					>
						<MessageSquare size={18} />
						<span>{comments.length}</span>
					</button>
					<button className="action-btn share-btn" onClick={handleShare}>
						<Share size={18} />
						<span>{post.shares}</span>
					</button>
				</div>
			</div>

			{/* Comments Section */}
			{showComments && (
				<div className="comments-section">
					{comments.map((comment) => (
						<div key={comment.id} className="comment">
							<div className="comment-avatar">
								{comment.User?.profilePicture && (
									<img
										src={comment.User.profilePicture}
										alt="avatar"
										style={{ width: 32, height: 32, borderRadius: "50%" }}
									/>
								)}
							</div>
							<div className="comment-content">
								<div className="comment-bubble">
									<div className="comment-header">
										<span className="comment-user">
											{comment.User?.fullName}
										</span>
										<span className="comment-username">
											{comment.User?.username}
										</span>
										<span className="comment-timestamp">
											{formattedPostTime || comment.timestamp}
										</span>
										{user?.account?.id === comment.User?.id && (
											<div className="comment-menu-wrapper">
												<button
													className="comment-menu-btn"
													onClick={(e) => {
														e.stopPropagation();
														setActiveCommentMenu(
															activeCommentMenu === comment.id ? null : comment.id
														);
													}}
												>
													<MoreHorizontal size={14} />
												</button>
												{activeCommentMenu === comment.id && (
													<div className="comment-dropdown-menu">
														{editingCommentId !== comment.id && (
															<button
																className="dropdown-item"
																onClick={() => {
																	setEditingCommentId(comment.id);
																	setEditedCommentText(comment.content);
																	setActiveCommentMenu(null);
																}}
															>
																<span>Edit Comment</span>
															</button>
														)}
														<button
															className="dropdown-item delete-item"
															onClick={() => handleDeleteComment(comment)}
														>
															<span>Delete Comment</span>
														</button>
													</div>
												)}
											</div>
										)}
									</div>
									{editingCommentId === comment.id ? (
										<div className="comment-edit-area">
											<input
												className="comment-edit-input"
												value={editedCommentText}
												onChange={(e) => setEditedCommentText(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter") handleSaveEditedComment();
													if (e.key === "Escape") handleCancelEdit();
												}}
												autoFocus
											/>
											<div className="comment-edit-actions">
												<button
													className="comment-edit-btn save"
													onClick={handleSaveEditedComment}
													disabled={!editedCommentText.trim()}
												>
													Save
												</button>
												<button
													className="comment-edit-btn cancel"
													onClick={handleCancelEdit}
												>
													Cancel
												</button>
											</div>
										</div>
									) : (
										<p className="comment-text">{comment.content}</p>
									)}
								</div>
							</div>
						</div>
					))}

					{/* Add Comment Input */}
					<div className="add-comment">
						<div className="comment-avatar"></div>
						<div className="comment-input-wrapper">
							<input
								type="text"
								placeholder="Write a comment..."
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
								className="comment-input"
							/>
							<button
								className="comment-send-btn"
								onClick={handleAddComment}
								disabled={!commentText.trim()}
							>
								<Send size={16} />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Post Modal */}
			<EditPost
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				post={post}
				onUpdatePost={onUpdatePost}
			/>

			{/* Delete Post Modal */}
			<DeletePost
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				post={post}
			/>

			{isCheckingToxic && (
				<div className="post-modal-overlay">
					<div className="post-modal">
						<p>Checking comment for toxicity...</p>
					</div>
				</div>
			)}

			{showToxicModal && (
				<div className="post-modal-overlay">
					<div className="post-modal post-modal-danger">
						<p>This comment appears to contain toxic content. Please edit it.</p>
						{toxicResult?.details && (
							<small style={{ color: "#ef4444" }}>
								{JSON.stringify(toxicResult.details)}
							</small>
						)}
						<div className="post-modal-actions">
							<button
								className="post-modal-btn"
								onClick={() => {
									setShowToxicModal(false);
									setToxicResult(null);
								}}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Comment Confirm Modal */}
			{showDeleteCommentModal && (
				<div className="post-modal-overlay">
					<div className="post-modal">
						<p>Are you sure you want to delete this comment?</p>
						{commentToDelete?.content && (
							<small style={{ color: "#9ca3af", display: "block", marginTop: 8 }}>
								{commentToDelete.content}
							</small>
						)}
						<div className="post-modal-actions">
							<button className="post-modal-btn" onClick={cancelDeleteComment}>
								Cancel
							</button>
							<button
								className="post-modal-btn danger"
								onClick={confirmDeleteComment}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Post;
