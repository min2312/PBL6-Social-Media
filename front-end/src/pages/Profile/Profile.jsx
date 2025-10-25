import React, { useContext, useEffect, useState } from "react";
import {
	Calendar,
	MapPin,
	Link as LinkIcon,
	X,
	MessageSquare,
	UserX,
	AlertCircle,
	Home,
} from "lucide-react";
import Post from "../../components/Post/Post";
import "./Profile.css";
import { UserContext } from "../../Context/UserProvider";
import { useParams, useHistory } from "react-router-dom";
import { GetAllPost, HandleGetLikePost } from "../../services/apiService";
import { GetAllUser } from "../../services/userService";

const Profile = () => {
	const [activeTab, setActiveTab] = useState("posts");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const { user } = useContext(UserContext);
	const { id } = useParams();
	const history = useHistory();
	const [profileData, setProfileData] = useState({
		fullName: "",
		username: "",
		bio: "",
		location: "",
		website: "",
		joinDate: "",
		posts: 0,
		avatar: null,
	});

	const [editForm, setEditForm] = useState({
		fullName: "",
		bio: "",
		location: "",
		website: "",
		avatar: null,
	});

	const [avatarPreview, setAvatarPreview] = useState(null);
	const [userPosts, setUserPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const formatTimeAgo = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		if (diffMinutes < 1) return "Just now";
		if (diffMinutes < 60) return `${diffMinutes}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return date.toLocaleString("en-US", { day: "numeric", month: "short" });
	};

	useEffect(() => {
		const fetchProfile = async () => {
			if (!id) {
				setError("User ID is required");
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const res = await GetAllPost(id);
				if (res && res.errCode === 0) {
					const hasPosts = Array.isArray(res.post) && res.post.length > 0;
					if (hasPosts) {
						const u = res.post[0].User || {};
						const joinDate = u.createdAt
							? new Date(u.createdAt).toLocaleString("en-US", {
									month: "long",
									year: "numeric",
							  })
							: "";
						const mappedProfile = {
							fullName: u.fullName || "",
							username:
								u.username || (u.email ? `@${u.email.split("@")[0]}` : ""),
							bio: u.bio || "",
							location: u.location || "",
							website: u.website || "",
							joinDate,
							posts: res.post.length,
							avatar: u.profilePicture || u.avatar || null,
						};
						setProfileData(mappedProfile);
						setEditForm({
							fullName: mappedProfile.fullName,
							bio: mappedProfile.bio,
							location: mappedProfile.location,
							website: mappedProfile.website,
							avatar: mappedProfile.avatar,
						});

						const formattedPosts = await Promise.all(
							res.post.map(async (post) => {
								const likeRes = await HandleGetLikePost(post.id);
								const likesCount =
									likeRes && likeRes.errCode === 0 ? likeRes.likes.length : 0;
								const isLiked =
									likeRes && likeRes.errCode === 0
										? likeRes.likes.some((l) => l.userId === user?.account?.id)
										: false;
								return {
									id: post.id,
									User: {
										id: u.id,
										fullName: mappedProfile.fullName,
										username: mappedProfile.username,
										avatar: mappedProfile.avatar || null,
									},
									content: post.content,
									images: post.imageUrl,
									likes: likesCount,
									islikedbyUser: isLiked,
									comments: [],
									shares: 0,
									timestamp: post.updatedAt || post.createdAt,
									formatTimeAgo,
								};
							})
						);
						setUserPosts(formattedPosts);
					} else {
						// No posts - fallback to GetAllUser
						const userRes = await GetAllUser(id);
						if (userRes && userRes.errCode === 0 && userRes.user) {
							const u = userRes.user;
							const joinDate = u.createdAt
								? new Date(u.createdAt).toLocaleString("en-US", {
										month: "long",
										year: "numeric",
								  })
								: "";
							const mappedProfile = {
								id: u.id,
								fullName: u.fullName || "",
								username:
									u.username || (u.email ? `@${u.email.split("@")[0]}` : ""),
								bio: u.bio || "",
								location: u.location || "",
								website: u.website || "",
								joinDate,
								posts: 0,
								avatar: u.profilePicture || u.avatar || null,
							};
							setProfileData(mappedProfile);
							setEditForm({
								id: mappedProfile.id,
								fullName: mappedProfile.fullName,
								bio: mappedProfile.bio,
								location: mappedProfile.location,
								website: mappedProfile.website,
								avatar: mappedProfile.avatar,
							});
							setUserPosts([]);
						} else {
							setError(
								"User not found. This user might not exist or has been deleted."
							);
						}
					}
				} else {
					// API returned an error
					if (res && res.errCode === 1) {
						setError("User not found. Please check the user ID and try again.");
					} else {
						setError(
							res?.errMessage ||
								"Failed to load profile. Please try again later."
						);
					}
				}
			} catch (e) {
				console.error("Profile fetch error:", e);
				setError("Network error. Please check your connection and try again.");
			} finally {
				setLoading(false);
			}
		};
		fetchProfile();
	}, [id, user?.account?.id]);

	const handleEditProfile = () => {
		setEditForm({
			fullName: profileData.fullName,
			bio: profileData.bio,
			location: profileData.location,
			website: profileData.website,
			avatar: profileData.avatar,
		});
		setAvatarPreview(null);
		setIsEditModalOpen(true);
	};

	const handleSaveProfile = () => {
		setProfileData((prev) => ({
			...prev,
			...editForm,
		}));
		setIsEditModalOpen(false);
		setAvatarPreview(null);
	};

	const handleUpdatePost = (updatedPost) => {
		setUserPosts((prev) =>
			prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
		);
	};
	const handleDeletePost = (postToDelete) => {
		setUserPosts((prev) => prev.filter((post) => post.id !== postToDelete.id));
	};
	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const imageUrl = e.target.result;
				setAvatarPreview(imageUrl);
				setEditForm((prev) => ({
					...prev,
					avatar: imageUrl,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveAvatar = () => {
		setAvatarPreview(null);
		setEditForm((prev) => ({
			...prev,
			avatar: null,
		}));
	};

	const ErrorState = ({ error }) => {
		const getErrorDetails = (errorMsg) => {
			if (errorMsg.includes("not found") || errorMsg.includes("not exist")) {
				return {
					icon: UserX,
					title: "User Not Found",
					message: "This user doesn't exist or may have been deleted.",
					action: "Go Back to Home",
					actionFn: () => history.push("/"),
				};
			}
			if (
				errorMsg.includes("Network error") ||
				errorMsg.includes("connection")
			) {
				return {
					icon: AlertCircle,
					title: "Connection Error",
					message: "Please check your internet connection and try again.",
					action: "Retry",
					actionFn: () => window.location.reload(),
				};
			}
			return {
				icon: AlertCircle,
				title: "Something went wrong",
				message: errorMsg || "An unexpected error occurred.",
				action: "Go Back to Home",
				actionFn: () => history.push("/"),
			};
		};

		const {
			icon: ErrorIcon,
			title,
			message,
			action,
			actionFn,
		} = getErrorDetails(error);

		return (
			<div className="error-state">
				<div className="error-content">
					<ErrorIcon size={64} className="error-icon" />
					<h2 className="error-title">{title}</h2>
					<p className="error-message">{message}</p>
					<button className="error-action-btn" onClick={actionFn}>
						<Home size={16} />
						{action}
					</button>
				</div>
			</div>
		);
	};

	const renderPosts = () => {
		if (userPosts.length === 0) {
			return (
				<div className="no-posts">
					<MessageSquare size={48} className="no-posts-icon" />
					<h3>No posts yet</h3>
					<p>When you share posts, they'll appear here.</p>
				</div>
			);
		}

		return (
			<div className="profile-posts">
				{userPosts.map((post) => (
					<Post
						key={post.id}
						post={{ ...post, formatTimeAgo }}
						onUpdatePost={handleUpdatePost}
						onDeletePost={handleDeletePost}
					/>
				))}
			</div>
		);
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "posts":
				return renderPosts();
			case "media":
				return (
					<div className="no-posts">
						<MessageSquare size={48} className="no-posts-icon" />
						<h3>No media yet</h3>
						<p>Photos and videos shared will appear here.</p>
					</div>
				);
			case "likes":
				return (
					<div className="no-posts">
						<MessageSquare size={48} className="no-posts-icon" />
						<h3>No liked posts</h3>
						<p>Liked posts will appear here.</p>
					</div>
				);
			default:
				return renderPosts();
		}
	};

	return (
		<div className="profile-container">
			{/* Profile Header - Only show if no error */}
			{!error && (
				<>
					<div className="profile-header">
						<div className="cover-photo"></div>
						<div className="profile-info">
							<div
								className="profile-avatar"
								style={{
									backgroundImage: profileData.avatar
										? `url(${profileData.avatar})`
										: "none",
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							></div>
							<div className="profile-details">
								<h1 className="profile-name">{profileData.fullName}</h1>
								<p className="profile-username">{profileData.username}</p>
								<p className="profile-bio">{profileData.bio}</p>

								<div className="profile-meta">
									<div className="meta-item">
										<MapPin size={16} className="meta-icon" />
										<span>{profileData.location}</span>
									</div>
									<div className="meta-item">
										<LinkIcon size={16} className="meta-icon" />
										<a
											href={profileData.website}
											target="_blank"
											rel="noopener noreferrer"
										>
											{profileData.website}
										</a>
									</div>
									<div className="meta-item">
										<Calendar size={16} className="meta-icon" />
										<span>Joined {profileData.joinDate}</span>
									</div>
								</div>

								<div className="profile-actions">
									{user?.account?.id?.toString() === id?.toString() && (
										<button
											className="edit-profile-btn"
											onClick={handleEditProfile}
										>
											Edit Profile
										</button>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Profile Tabs - Only show if no error */}
					<div className="profile-tabs">
						<button
							className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
							onClick={() => setActiveTab("posts")}
						>
							Posts
						</button>
						<button
							className={`tab-button ${activeTab === "media" ? "active" : ""}`}
							onClick={() => setActiveTab("media")}
						>
							Media
						</button>
						<button
							className={`tab-button ${activeTab === "likes" ? "active" : ""}`}
							onClick={() => setActiveTab("likes")}
						>
							Likes
						</button>
					</div>
				</>
			)}

			{/* Tab Content */}
			{loading ? (
				<div className="no-posts">
					<MessageSquare size={48} className="no-posts-icon" />
					<h3>Loading...</h3>
				</div>
			) : error ? (
				<ErrorState error={error} />
			) : (
				renderTabContent()
			)}

			{/* Edit Profile Modal */}
			{isEditModalOpen && (
				<div
					className="edit-modal-overlay"
					onClick={() => setIsEditModalOpen(false)}
				>
					<div
						className="edit-modal-content"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="edit-modal-header">
							<h2 className="edit-modal-title">Edit Profile</h2>
							<button
								className="close-btn"
								onClick={() => setIsEditModalOpen(false)}
							>
								<X size={24} />
							</button>
						</div>

						<div className="edit-modal-body">
							<form className="edit-form">
								<div className="form-group">
									<label className="form-label">Profile Picture</label>
									<div className="avatar-upload-section">
										<div
											className="avatar-preview"
											style={{
												backgroundImage:
													avatarPreview || editForm.avatar
														? `url(${avatarPreview || editForm.avatar})`
														: "none",
												backgroundSize: "cover",
												backgroundPosition: "center",
											}}
										>
											{!avatarPreview && !editForm.avatar && (
												<span className="avatar-placeholder">No Image</span>
											)}
										</div>
										<div className="avatar-controls">
											<input
												type="file"
												id="avatar-upload"
												accept="image/*"
												onChange={handleAvatarChange}
												className="avatar-input"
											/>
											<label htmlFor="avatar-upload" className="upload-btn">
												Choose Image
											</label>
											{(avatarPreview || editForm.avatar) && (
												<button
													type="button"
													onClick={handleRemoveAvatar}
													className="remove-avatar-btn"
												>
													Remove
												</button>
											)}
										</div>
									</div>
								</div>

								<div className="form-group">
									<label className="form-label">Name</label>
									<input
										type="text"
										className="form-input"
										value={editForm.fullName}
										onChange={(e) =>
											setEditForm((prev) => ({
												...prev,
												fullName: e.target.value,
											}))
										}
										placeholder="Your Name"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Bio</label>
									<textarea
										className="form-textarea"
										value={editForm.bio}
										onChange={(e) =>
											setEditForm((prev) => ({ ...prev, bio: e.target.value }))
										}
										placeholder="Tell us about yourself"
										maxLength={160}
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Location</label>
									<input
										type="text"
										className="form-input"
										value={editForm.location}
										onChange={(e) =>
											setEditForm((prev) => ({
												...prev,
												location: e.target.value,
											}))
										}
										placeholder="Where are you located?"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Website</label>
									<input
										type="url"
										className="form-input"
										value={editForm.website}
										onChange={(e) =>
											setEditForm((prev) => ({
												...prev,
												website: e.target.value,
											}))
										}
										placeholder="https://yourwebsite.com"
									/>
								</div>
							</form>
						</div>

						<div className="edit-modal-footer">
							<button
								className="cancel-btn"
								onClick={() => setIsEditModalOpen(false)}
							>
								Cancel
							</button>
							<button className="save-btn" onClick={handleSaveProfile}>
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Profile;
