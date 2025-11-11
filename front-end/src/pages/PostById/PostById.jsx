import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import Post from "../../components/Post/Post";
import { GetPostByPostId, HandleGetLikePost } from "../../services/apiService";
import { UserContext } from "../../Context/UserProvider";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "./PostById.css";

const PostById = () => {
	const { postId } = useParams();
	const history = useHistory();
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { user } = useContext(UserContext);
	const [socket, setSocket] = useState(null);

	function formatTimeAgo(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;

		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMinutes < 1) return "Just now";
		if (diffMinutes < 60) return `${diffMinutes}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;

		return date.toLocaleString("en-US", {
			day: "numeric",
			month: "short",
		});
	}

	useEffect(() => {
		const fetchPost = async () => {
			try {
				setLoading(true);
				const response = await GetPostByPostId(postId);
				if (response && response.errCode === 0) {
					// Get likes data for the post
					const likesData = await HandleGetLikePost(response.post.id);
					
					// Format the post data to match Post component expectations
					const formattedPost = {
						...response.post,
						images: response.post.imageUrl || [],
						comments: response.post.Comments || [],
						likes: likesData && likesData.errCode === 0 ? likesData.likes.length : 0,
						islikedbyUser: likesData && likesData.errCode === 0 
							? likesData.likes.some(like => like.userId === user?.account?.id)
							: false,
						shares: 0, // Add default shares if not in API
						timestamp: response.post.updatedAt,
						formatTimeAgo: formatTimeAgo
					};
					setPost(formattedPost);
				} else {
					setError(response?.errMessage || "Post not found");
				}
			} catch (err) {
				setError(err.message || "Error loading post");
			} finally {
				setLoading(false);
			}
		};

		if (postId && user?.account?.id) {
			fetchPost();
		}
	}, [postId, user?.account?.id]);

	// Socket connection setup
	useEffect(() => {
		if (!user || !user.token) {
			return;
		}

		const newSocket = io(`${process.env.REACT_APP_API_URL}`, {
			extraHeaders: {
				Authorization: `Bearer ${user.token}`,
			},
		});

		newSocket.on("connect", () => {
			console.log("PostById connected to WebSocket:", newSocket.id);
		});

		newSocket.on("postUpdated", (updatedPost) => {
			if (post && post.id === updatedPost.id) {
				setPost(updatedPost);
			}
		});

		newSocket.on("postDeleted", (postToDelete) => {
			if (post && post.id === postToDelete.id) {
				toast.info("This post has been deleted");
				history.push("/");
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
	}, [user, post?.id, history]);

	const handleUpdatePost = (updatedPost) => {
		if (socket) {
			socket.emit("updatePost", updatedPost);
		}
		setPost(updatedPost);
	};

	const handleDeletePost = () => {
		if (socket && post) {
			socket.emit("deletePost", post);
		}
		history.push("/");
	};

	if (loading) {
		return (
			<div className="post-by-id-container">
				<div className="loading">Loading post...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="post-by-id-container">
				<div className="error">
					<p>{error}</p>
					<button onClick={() => history.push("/")} className="back-btn">
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="post-by-id-container">
				<div className="error">
					<p>Post not found</p>
					<button onClick={() => history.push("/")} className="back-btn">
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="post-by-id-container">
			<div className="post-by-id-header">
				<button onClick={() => history.goBack()} className="back-btn">
					← Back
				</button>
			</div>
			<div className="post-by-id-content">
				<Post
					post={{ ...post, formatTimeAgo }}
					onUpdatePost={handleUpdatePost}
					onDeletePost={handleDeletePost}
				/>
			</div>
		</div>
	);
};

export default PostById;
