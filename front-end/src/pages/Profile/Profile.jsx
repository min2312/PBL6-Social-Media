import React, { useContext, useState } from "react";
import {
	Calendar,
	MapPin,
	Link as LinkIcon,
	X,
	MessageSquare,
} from "lucide-react";
import Post from "../../components/Post/Post";
import "./Profile.css";
import { UserContext } from "../../Context/UserProvider";

const Profile = () => {
	const [activeTab, setActiveTab] = useState("posts");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const { user } = useContext(UserContext);
	const isoString = user.account.createdAt;
	const date = new Date(isoString);

	const formatted = date.toLocaleString("en-US", {
		month: "long",
		year: "numeric",
	});
	const [profileData, setProfileData] = useState({
		fullName: user ? user.account.fullName : "Esmeralda Rodriguez",
		username: user ? user.account.username : "@esmeralda",
		bio: user
			? user.account.bio
			: "Frontend Developer | React Enthusiast | Coffee Lover ☕\nBuilding amazing user experiences one component at a time.",
		location: user ? user.account.location : "San Francisco, CA",
		website: user ? user.account.website : "https://esmeralda.dev",
		joinDate: user ? formatted : "March 2020",
		posts: 245,
		avatar: user ? user.account.avatar : null,
	});

	const [editForm, setEditForm] = useState({
		fullName: profileData.fullName,
		bio: profileData.bio,
		location: profileData.location,
		website: profileData.website,
		avatar: profileData.avatar,
	});

	const [avatarPreview, setAvatarPreview] = useState(null);

	const [userPosts, setUserPosts] = useState([
		{
			id: 1,
			user: {
				fullName: "Esmeralda Rodriguez",
				username: "@esmeralda",
				avatar: "/api/placeholder/40/40",
			},
			content:
				"Just finished implementing a new feature using React hooks! The component lifecycle is so much cleaner now 🚀",
			images: [],
			likes: 24,
			comments: [
				{
					id: 1,
					user: {
						fullName: "John Doe",
						username: "@johndoe",
						avatar: "/api/placeholder/32/32",
					},
					content: "Great work! React hooks are amazing 👏",
					likes: 3,
					timestamp: "1h ago",
					isLiked: false,
				},
			],
			shares: 2,
			timestamp: "2 hours ago",
		},
		{
			id: 2,
			user: {
				fullName: "Esmeralda Rodriguez",
				username: "@esmeralda",
				avatar: "/api/placeholder/40/40",
			},
			content:
				"Beautiful sunset from my office window. Sometimes you need to pause and appreciate the simple things in life 🌅",
			images: ["/api/placeholder/400/300"],
			likes: 89,
			comments: [],
			shares: 7,
			timestamp: "1 day ago",
		},
	]);

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
					<Post key={post.id} post={post} onUpdatePost={handleUpdatePost} />
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
			{/* Profile Header */}
			<div className="profile-header">
				<div className="cover-photo"></div>
				<div className="profile-info">
					<div
						className="profile-avatar"
						style={{
							backgroundImage: profileData.avatar ? `url(${profileData.avatar})` : 'none',
							backgroundSize: 'cover',
							backgroundPosition: 'center'
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
							<button className="edit-profile-btn" onClick={handleEditProfile}>
								Edit Profile
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Stats */}
			{/* <div className="profile-stats">
				<div className="stat-item">
					<p className="stat-number">{profileData.posts}</p>
					<p className="stat-label">Posts</p>
				</div>
			</div> */}

			{/* Profile Tabs */}
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

			{/* Tab Content */}
			{renderTabContent()}

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
												backgroundImage: (avatarPreview || editForm.avatar) ? `url(${avatarPreview || editForm.avatar})` : 'none',
												backgroundSize: 'cover',
												backgroundPosition: 'center'
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
