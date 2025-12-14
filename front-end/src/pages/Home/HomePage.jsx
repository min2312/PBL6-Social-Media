import React, { useContext, useEffect, useState } from "react";
import AddPost from "../../components/AddPost/AddPost";
import Post from "../../components/Post/Post";
import "./HomePage.css";
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
import { checkToxicComment } from "../../services/aiService";
const HomePage = () => {
	const [isAddPostOpen, setIsAddPostOpen] = useState(false);
	const [posts, setPosts] = useState([]);
	const { user } = useContext(UserContext);
	const [socket, setSocket] = useState(null);
	const history = useHistory();
	const [isCheckingNSFW, setIsCheckingNSFW] = useState(false);
	const [nsfwModalOpen, setNsfwModalOpen] = useState(false);
	const [nsfwResults, setNsfwResults] = useState([]);
	const [isCheckingToxic, setIsCheckingToxic] = useState(false);
	const [showToxicModal, setShowToxicModal] = useState(false);
	const [toxicResult, setToxicResult] = useState(null);
	const [showViolenceModal, setShowViolenceModal] = useState(false);
	const [violenceResult, setViolenceResult] = useState(null);

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

	// Check violence via Flask API directly
	const checkVideoViolence = async (videoFile) => {
		try {
			const formData = new FormData();
			formData.append("video", videoFile);
			formData.append("threshold", "0.5");
			formData.append("min_detections", "10");

			const response = await fetch("http://localhost:5000/api/check-violence", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to check violence");
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Violence check error:", error);
			throw error;
		}
	};

	const handleAddPost = async (postData) => {
		if (
			postData.content === "" &&
			(!postData.imageUrl || postData.imageUrl.length === 0) &&
			!postData.video
		) {
			toast.error("Post cannot be empty");
			return;
		}

		// BƯỚC 1: Check toxic content trước nếu có nội dung
		if (postData.content && postData.content.trim()) {
			setIsCheckingToxic(true);
			try {
				const toxicCheck = await checkToxicComment(postData.content);
				setIsCheckingToxic(false);

				const isToxic = toxicCheck?.label && toxicCheck.label !== 0;
				if (isToxic) {
					setToxicResult(toxicCheck);
					setShowToxicModal(true);
					return;
				}
			} catch (error) {
				setIsCheckingToxic(false);
				console.error("Toxic check failed:", error);
				toast.error("Content check failed. Please try again.");
				return;
			}
		}

		// BƯỚC 2: Check NSFW TRƯỚC nếu có ảnh
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

		// BƯỚC 3: Check video violence TRƯỚC khi tạo post
		if (postData.video) {
			setShowViolenceModal(false);
			setViolenceResult(null);

			try {
				// Call Flask API directly
				const violenceResponse = await checkVideoViolence(postData.video);

				if (violenceResponse?.violence_detected) {
					setViolenceResult(violenceResponse);
					setShowViolenceModal(true);
					return; // Stop if violence detected
				}
			} catch (error) {
				console.error("Violence check failed:", error);
				toast.error("Video check failed. Please try again.");
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

			// Thêm video vào FormData nếu có
			if (postData.video) {
				formData.append("video", postData.video);
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
				
				// Hiển thị thông báo thành công
				if (postData.video) {
					toast.success("✅ Video passed violence check! Post created successfully!");
				} else {
					toast.success("Post created successfully!");
				}
			} else {
				toast.error(newPost.errMessage || "Error creating post");
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
										{/* ({result.confidence}% confidence) */}
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

	const ToxicModal = () => {
		return (
			<div
				className="nsfw-modal-overlay"
				onClick={() => setShowToxicModal(false)}
			>
				<div
					className="nsfw-modal-content"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="nsfw-modal-header">
						<div className="nsfw-warning-icon">
							<AlertTriangle size={32} color="#ef4444" />
						</div>
						<h2>Toxic Content Detected</h2>
						<button
							className="nsfw-close-btn"
							onClick={() => setShowToxicModal(false)}
						>
							<X size={20} />
						</button>
					</div>
					<div className="nsfw-modal-body">
						<p>
							We detected potentially toxic content in your post. Please review
							our community guidelines:
						</p>
						{toxicResult?.details && (
							<div className="nsfw-violations">
								<div>
									<strong>Content Issue:</strong>
									<span className="violation-label">
										{JSON.stringify(toxicResult.details)}
									</span>
								</div>
							</div>
						)}
						<div className="nsfw-guidelines">
							<h4>Community Guidelines:</h4>
							<ul>
								<li>Be respectful and kind to others</li>
								<li>No hate speech or harassment</li>
								<li>Avoid offensive or inflammatory language</li>
								<li>Keep discussions constructive and positive</li>
							</ul>
						</div>
					</div>
					<div className="nsfw-modal-footer">
						<button
							className="nsfw-understand-btn"
							onClick={() => setShowToxicModal(false)}
						>
							I Understand
						</button>
					</div>
				</div>
			</div>
		);
	};

	const ViolenceModal = () => {
		return (
			<div
				className="nsfw-modal-overlay"
				onClick={() => setShowViolenceModal(false)}
			>
				<div
					className="nsfw-modal-content"
					onClick={(e) => e.stopPropagation()}
					style={{ maxWidth: '600px' }}
				>
					<div className="nsfw-modal-header" style={{ background: '#1f2937', borderBottom: '2px solid #dc2626' }}>
						<div className="nsfw-warning-icon" style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)' }}>
							<AlertTriangle size={32} color="#ff6b6b" />
						</div>
						<h2 style={{ color: '#ff6b6b' }}>⚠️ Violent Content Detected</h2>
						<button
							className="nsfw-close-btn"
							onClick={() => setShowViolenceModal(false)}
						>
							<X size={20} />
						</button>
					</div>
					<div className="nsfw-modal-body">
						<p style={{ marginBottom: '16px', fontWeight: '500', color: '#fca5a5', fontSize: '15px' }}>
							⚠️ Your video cannot be posted. Violent content was detected in the following time periods:
						</p>
						{violenceResult?.violent_segments && violenceResult.violent_segments.length > 0 && (
							<div style={{ 
								background: 'rgba(220, 38, 38, 0.1)', 
								border: '2px solid rgba(220, 38, 38, 0.3)', 
								borderRadius: '8px', 
								padding: '16px',
								marginBottom: '16px'
							}}>
								<ul className="nsfw-violations" style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
									{violenceResult.violent_segments.map((segment, index) => (
										<li key={index} style={{ marginBottom: '12px', fontSize: '15px', color: '#ffffff' }}>
											<strong style={{ color: '#ff6b6b', fontSize: '16px' }}>
												⏱️ Time: {segment.start} → {segment.end}
											</strong>
											{segment.detection_count && (
												<div style={{ marginTop: '4px' }}>
													<span style={{ 
														display: 'block', 
														fontSize: '13px', 
														color: '#d1d5db',
														marginTop: '2px' 
													}}>
														🚨 {segment.detection_count} consecutive violent clips detected
													</span>
												</div>
											)}
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="nsfw-guidelines" style={{ background: 'rgba(75, 85, 99, 0.3)', borderRadius: '8px', padding: '16px' }}>
							<h4 style={{ color: '#fbbf24', marginBottom: '12px' }}>Community Guidelines:</h4>
							<ul style={{ color: '#e5e7eb', lineHeight: '1.8' }}>
								<li>❌ No violent or graphic content showing physical harm</li>
								<li>❌ No content depicting fights, assaults, or violent acts</li>
								<li>✅ Keep content safe and appropriate for all audiences</li>
								<li>📧 Contact our moderation team if you believe this is a mistake</li>
							</ul>
						</div>
						{violenceResult && (
							<div style={{ 
								marginTop: '16px', 
								padding: '12px',
								background: 'rgba(59, 130, 246, 0.1)',
								border: '1px solid rgba(59, 130, 246, 0.3)',
								borderRadius: '6px',
								fontSize: '14px', 
								color: '#93c5fd' 
							}}>
								<p style={{ margin: '0 0 8px 0', color: '#60a5fa' }}><strong>📊 Analysis Summary:</strong></p>
								<p style={{ margin: '4px 0' }}>• Video duration: {violenceResult.duration?.toFixed(2)} seconds</p>
								<p style={{ margin: '4px 0' }}>• Total clips analyzed: {violenceResult.total_clips_analyzed}</p>
								<p style={{ margin: '4px 0' }}>• Violent segments found: {violenceResult.violent_segments.length}</p>
							</div>
						)}
					</div>
					<div className="nsfw-modal-footer">
						<button
							className="nsfw-understand-btn"
							onClick={() => setShowViolenceModal(false)}
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
					<div className="post-avatar">
						{user?.account?.profilePicture ? (
							<img
								src={user.account.profilePicture}
								alt="avatar"
								style={{
									width: "100%",
									height: "100%",
									borderRadius: "50%",
									objectFit: "cover",
								}}
							/>
						) : (
							<span>
								{user?.account?.fullName?.charAt(0)?.toUpperCase() || "U"}
							</span>
						)}
					</div>
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
				isLoading={isCheckingNSFW || isCheckingToxic}
				loadingText={
					isCheckingToxic
						? "Checking content for toxicity..."
						: "Checking content..."
				}
			/>

		{/* NSFW Warning Modal */}
		{nsfwModalOpen && <NSFWModal />}

		{/* Toxic Content Warning Modal */}
		{showToxicModal && <ToxicModal />}

		{/* Violence Warning Modal */}
		{showViolenceModal && <ViolenceModal />}
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
