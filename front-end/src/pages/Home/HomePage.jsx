import React, { useContext, useEffect, useState } from "react";
import AddPost from "../../components/AddPost/AddPost";
import Post from "../../components/Post/Post";
import "./Home.css";
import {
	CreateNewPost,
	GetAllPost,
	HandleGetLikePost,
} from "../../services/apiService";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { toast } from "react-toastify";
import { UserContext } from "../../Context/UserProvider";
import { io } from "socket.io-client";
import { checkNSFWContent } from "../../services/aiService";
import { AlertTriangle, X } from "lucide-react";
const HomePage = () => {
	const [isAddPostOpen, setIsAddPostOpen] = useState(false);
	const [posts, setPosts] = useState([]);
	const { user } = useContext(UserContext);
	const [socket, setSocket] = useState(null);
	const history = useHistory();
	const [isCheckingNSFW, setIsCheckingNSFW] = useState(false);
	const [nsfwModalOpen, setNsfwModalOpen] = useState(false);
	const [nsfwResults, setNsfwResults] = useState([]);
	const HandleGetAllPost = async () => {
		try {
			if (user && user.isAuthenticated === false) {
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
			console.log("search connected to WebSocket:", newSocket.id);
		});

		newSocket.on("postUpdated", (updatedPost) => {
			setPosts((prev) =>
				prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
			);
		});

		newSocket.on("postDeleted", (postToDelete) => {
			setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
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
		if (
			postData.content === "" &&
			(!postData.imageUrl || postData.imageUrl.length === 0)
		) {
			toast.error("Post cannot be empty");
			return;
		}

		// BƯỚC 1: Check NSFW TRƯỚC nếu có ảnh
		if (postData.imageUrl && postData.imageUrl.length > 0) {
			setIsCheckingNSFW(true);
			try {
				// Tạo FormData riêng cho NSFW check
				const nsfwFormData = new FormData();
				postData.imageUrl.forEach((img) => {
					nsfwFormData.append("image", img);
				});

				const nsfwCheck = await checkNSFWContent(nsfwFormData);
				setIsCheckingNSFW(false);

				if (nsfwCheck && nsfwCheck.length > 0) {
					const nsfwImages = nsfwCheck.filter(
						(result) =>
							result.label &&
							(result.label.toLowerCase().includes("nsfw") ||
								result.label.toLowerCase().includes("porn") ||
								result.label.toLowerCase().includes("sexy"))
					);

					if (nsfwImages.length > 0) {
						setNsfwResults(nsfwImages);
						setNsfwModalOpen(true);
						return;
					}
				}
			} catch (error) {
				setIsCheckingNSFW(false);
				console.error("NSFW check failed:", error);
				toast.error("Content check failed. Please try again.");
				return;
			}
		}

		try {
			const formData = new FormData();
			formData.append("userId", user?.account.id);
			formData.append("content", postData?.content);

			// Thêm ảnh vào FormData cho post
			if (postData.imageUrl && postData.imageUrl.length > 0) {
				postData.imageUrl.forEach((img) => {
					formData.append("image", img);
				});
			}

			const newPost = await CreateNewPost(formData);
			if (newPost && newPost.errCode === 0) {
				const formattedPost = await {
					...newPost.post,
					images: JSON.parse(newPost.post.imageUrl) || [],
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
		if (socket) {
			socket.emit("updatePost", updatedPost);
		}
		setPosts((prev) =>
			prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
		);
	};

	const handleDeletePost = (postToDelete) => {
		if (socket) {
			socket.emit("deletePost", postToDelete);
		}
		setPosts((prev) => prev.filter((post) => post.id !== postToDelete.id));
	};

	const NSFWModal = () => {
		return (
			<div
				className="nsfw-modal-overlay"
				onClick={() => setNsfwModalOpen(false)}
			>
				<div
					className="nsfw-modal-content"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="nsfw-modal-header">
						<div className="nsfw-warning-icon">
							<AlertTriangle size={32} color="#ef4444" />
						</div>
						<h2>Content Not Allowed</h2>
						<button
							className="nsfw-close-btn"
							onClick={() => setNsfwModalOpen(false)}
						>
							<X size={20} />
						</button>
					</div>
					<div className="nsfw-modal-body">
						<p>
							We detected inappropriate content in your images. Please review
							our community guidelines:
						</p>
						<ul className="nsfw-violations">
							{nsfwResults.map((result, index) => (
								<li key={index}>
									<strong>{result.filename || `Image ${index + 1}`}:</strong>
									<span className="violation-label">{result.label}</span>
									<span className="confidence">
										({result.confidence}% confidence)
									</span>
								</li>
							))}
						</ul>
						<div className="nsfw-guidelines">
							<h4>Community Guidelines:</h4>
							<ul>
								<li>No adult content or sexually explicit material</li>
								<li>No violent or disturbing imagery</li>
								<li>Keep content appropriate for all audiences</li>
							</ul>
						</div>
					</div>
					<div className="nsfw-modal-footer">
						<button
							className="nsfw-understand-btn"
							onClick={() => setNsfwModalOpen(false)}
						>
							I Understand
						</button>
					</div>
				</div>
			</div>
		);
	};

	return user && user.isAuthenticated ? (
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
						onDeletePost={handleDeletePost}
					/>
				))}
			</div>

			{/* Add Post Modal */}
			<AddPost
				isOpen={isAddPostOpen}
				onClose={() => setIsAddPostOpen(false)}
				onSubmit={handleAddPost}
				isLoading={isCheckingNSFW}
				loadingText="Checking content..."
			/>

			{/* NSFW Warning Modal */}
			{nsfwModalOpen && <NSFWModal />}
		</div>
	) : (
		<div
			className="logged-out-wrapper"
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
				padding: "20px",
			}}
		>
			<div
				className="logged-out-card"
				style={{
					maxWidth: 480,
					width: "100%",
					padding: "48px 40px",
					borderRadius: 20,
					boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
					textAlign: "center",
					background: "#2d3748",
					transform: "translateY(-20px)",
					border: "1px solid #4a5568",
				}}
			>
				<div
					style={{
						width: 80,
						height: 80,
						borderRadius: "50%",
						background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: "0 auto 24px",
						fontSize: "36px",
						color: "white",
					}}
				>
					👋
				</div>
				<h1
					style={{
						margin: 0,
						marginBottom: 12,
						fontSize: "32px",
						fontWeight: "700",
						color: "#ffffff",
					}}
				>
					Welcome to Social
				</h1>
				<p
					style={{
						color: "#a0aec0",
						marginBottom: 32,
						fontSize: "18px",
						lineHeight: "1.6",
						fontWeight: "400",
					}}
				>
					Connect with friends, share your moments, and discover amazing content
					from people around the world.
				</p>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 16,
						marginBottom: 24,
					}}
				>
					<div
						onClick={() => {
							history.push("/login");
						}}
						className="btn primary-btn"
						style={{
							padding: "16px 32px",
							borderRadius: 12,
							background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
							color: "#fff",
							textDecoration: "none",
							fontSize: "16px",
							fontWeight: "600",
							transition: "all 0.3s ease",
							border: "none",
							boxShadow: "0 4px 15px rgba(79, 70, 229, 0.3)",
						}}
						onMouseOver={(e) => {
							e.target.style.transform = "translateY(-2px)";
							e.target.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.4)";
						}}
						onMouseOut={(e) => {
							e.target.style.transform = "translateY(0)";
							e.target.style.boxShadow = "0 4px 15px rgba(79, 70, 229, 0.3)";
						}}
					>
						Sign In to Your Account
					</div>
					<div
						onClick={() => {
							history.push("/register");
						}}
						className="btn outline-btn"
						style={{
							padding: "16px 32px",
							borderRadius: 12,
							border: "2px solid #4f46e5",
							color: "#4f46e5",
							textDecoration: "none",
							fontSize: "16px",
							fontWeight: "600",
							background: "transparent",
							transition: "all 0.3s ease",
						}}
						onMouseOver={(e) => {
							e.target.style.background = "#4f46e5";
							e.target.style.color = "white";
							e.target.style.transform = "translateY(-2px)";
						}}
						onMouseOut={(e) => {
							e.target.style.background = "transparent";
							e.target.style.color = "#4f46e5";
							e.target.style.transform = "translateY(0)";
						}}
					>
						Create New Account
					</div>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 24,
						justifyContent: "center",
						marginTop: 32,
						paddingTop: 24,
						borderTop: "1px solid #4a5568",
					}}
				>
					<div style={{ textAlign: "center" }}>
						<div
							style={{
								fontSize: "24px",
								marginBottom: 8,
							}}
						>
							💬
						</div>
						<div
							style={{
								fontSize: "14px",
								color: "#a0aec0",
								fontWeight: "500",
							}}
						>
							Connect
						</div>
					</div>
					<div style={{ textAlign: "center" }}>
						<div
							style={{
								fontSize: "24px",
								marginBottom: 8,
							}}
						>
							📸
						</div>
						<div
							style={{
								fontSize: "14px",
								color: "#a0aec0",
								fontWeight: "500",
							}}
						>
							Share
						</div>
					</div>
					<div style={{ textAlign: "center" }}>
						<div
							style={{
								fontSize: "24px",
								marginBottom: 8,
							}}
						>
							🌟
						</div>
						<div
							style={{
								fontSize: "14px",
								color: "#a0aec0",
								fontWeight: "500",
							}}
						>
							Discover
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
