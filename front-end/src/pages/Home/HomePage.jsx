import React, { useContext, useEffect, useState } from "react";
import AddPost from "../../components/AddPost/AddPost";
import Post from "../../components/Post/Post";
import "./Home.css";
import {
	CreateNewPost,
	GetAllPost,
	HandleGetLikePost,
} from "../../services/apiService";
import { toast } from "react-toastify";
import { UserContext } from "../../Context/UserProvider";
const HomePage = () => {
	const [isAddPostOpen, setIsAddPostOpen] = useState(false);
	const [posts, setPosts] = useState([]);
	const { user } = useContext(UserContext);
	const HandleGetAllPost = async () => {
		try {
			if (!user) {
				toast.error("You must be logged in to view posts");
				return;
			}
			let response = await GetAllPost("ALL");
			if (response && response.errCode === 0) {
				const formattedPosts = await Promise.all(
					response.post.map(async (post) => ({
						...post,
						images: post.imageUrl,
						likes: await HandleGetLikePost(post.id).then((res) =>
							res && res.errCode === 0 ? res.likes.length : 0
						),
						islikedbyUser: await HandleGetLikePost(post.id).then((res) =>
							res && res.errCode === 0
								? res.likes.some((like) => like.userId === user.account.id)
								: false
						),
						comments: [],
						shares: 0,
						timestamp: post.updatedAt,
					}))
				);
				setPosts(formattedPosts);
				toast.success("Load Post Success");
			} else {
				toast.error(response.errMessage);
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		HandleGetAllPost();
	}, []);

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
	const handleAddPost = async (postData) => {
		// const newPost = {
		//   id: Date.now(),
		//   User: {
		//     fullName: 'Esmeralda',
		//     username: '@esmeralda',
		//     profilePicture: '/api/placeholder/40/40'
		//   },
		//   content: postData.caption,
		//   images: postData.images.map(img => img.url),
		//   likes: 0,
		//   comments: [],
		//   shares: 0,
		//   timestamp: 'Just now'
		// };
		try {
			const formData = new FormData();
			formData.append("userId", user?.account.id);
			formData.append("content", postData?.content);
			postData.imageUrl.forEach((img) => {
				formData.append("image", img);
			});
			const newPost = await CreateNewPost(formData);
			if (newPost && newPost.errCode === 0) {
				const formattedPost = await {
					...newPost.post,
					images: JSON.parse(newPost.post.imageUrl),
					likes: 0,
					comments: [],
					shares: 0,
					timestamp: newPost.post.updatedAt,
				};
				await setPosts((prev) => [formattedPost, ...prev]);
				toast.success("Post created successfully!");
			} else {
				toast.error(newPost.errMessage);
			}
		} catch (error) {
			toast.error("Error creating post");
			console.error("Error creating post:", error);
		}
	};

	const handleUpdatePost = (updatedPost) => {
		setPosts((prev) =>
			prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
		);
	};

	return (
		<div className="content-wrapper">
			{/* New Post Input - Click to open modal */}
			<div className="new-post" onClick={() => setIsAddPostOpen(true)}>
				<div className="post-input-container">
					<div className="post-avatar"></div>
					<div className="post-input-wrapper">
						<div className="post-textarea-placeholder">
							What's on your mind?
						</div>
					</div>
				</div>
			</div>

			{/* Posts Feed */}
			<div className="posts-feed">
				{posts.map((post) => (
					<Post
						key={post.id}
						post={{ ...post, formatTimeAgo }}
						onUpdatePost={handleUpdatePost}
					/>
				))}
			</div>

			{/* Add Post Modal */}
			<AddPost
				isOpen={isAddPostOpen}
				onClose={() => setIsAddPostOpen(false)}
				onSubmit={handleAddPost}
			/>
		</div>
	);
};

export default HomePage;
