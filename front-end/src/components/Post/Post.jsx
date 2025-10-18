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
	GetAllComment,
} from "../../services/apiService";

const Post = ({ post, onUpdatePost }) => {
	const [isLiked, setIsLiked] = useState(false);
	const [showComments, setShowComments] = useState(post.comments.length > 0);
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState(post.comments || []);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const dropdownRef = useRef(null);
	const { user } = useContext(UserContext);
	const formattedTime = useSmartRelativeTime(
		post.timestamp,
		post.formatTimeAgo
	);
	const formattedPostTime = useSmartRelativeTime(
		post.timestamp,
		post.formatTimeAgo
	);
	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false);
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
		if (commentText.trim()) {
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
			onUpdatePost({ ...post, comments: comments.length + 1 });
		}
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

	const handleConfirmDelete = (postToDelete) => {
		// TODO: Implement actual delete functionality
		console.log("Deleting post:", postToDelete.id);
		// You can call an API here to delete the post
		// For now, we'll just log it
	};

	const toggleDropdown = (e) => {
		e.stopPropagation();
		setShowDropdown(!showDropdown);
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
									</div>
									<p className="comment-text">{comment.content}</p>
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
		</div>
	);
};

export default Post;
