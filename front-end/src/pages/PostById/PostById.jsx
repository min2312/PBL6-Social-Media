import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import Post from "../../components/Post/Post";
import { GetPostByPostId } from "../../services/apiService";
import "./PostById.css";

const PostById = () => {
	const { postId } = useParams();
	const history = useHistory();
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				setLoading(true);
				const response = await GetPostByPostId(postId);
				if (response && response.errCode === 0) {
					// Format the post data to match Post component expectations
					const formattedPost = {
						...response.post,
						images: response.post.imageUrl || [],
						comments: response.post.Comments || [],
						likes: response.post.likesCount || 0,
						shares: 0, // Add default shares if not in API
						islikedbyUser: false, // You may need to check this based on current user
						formatTimeAgo: (timestamp) => {
							const now = new Date();
							const time = new Date(timestamp);
							const diff = Math.floor((now - time) / 1000);
							
							if (diff < 60) return `${diff}s`;
							if (diff < 3600) return `${Math.floor(diff / 60)}m`;
							if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
							return `${Math.floor(diff / 86400)}d`;
						}
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

		if (postId) {
			fetchPost();
		}
	}, [postId]);

	const handleUpdatePost = (updatedPost) => {
		setPost(updatedPost);
	};

	const handleDeletePost = () => {
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
					post={post}
					onUpdatePost={handleUpdatePost}
					onDeletePost={handleDeletePost}
				/>
			</div>
		</div>
	);
};

export default PostById;
