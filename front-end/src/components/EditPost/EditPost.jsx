import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, AlertTriangle, Video } from "lucide-react";
import "./EditPost.css";
import { UpdatePost } from "../../services/apiService";
import { checkToxicComment } from "../../services/aiService";
import { toast } from "react-toastify";

const EditPost = ({ isOpen, onClose, post, onUpdatePost }) => {
	const [editData, setEditData] = useState({
		content: "",
		images: [],
		videoUrl: null,
	});
	const [newImages, setNewImages] = useState([]);
	const [newVideo, setNewVideo] = useState(null); // { url, file, duration }
	const [removeExistingVideo, setRemoveExistingVideo] = useState(false);
	const videoInputRef = useRef(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isCheckingToxic, setIsCheckingToxic] = useState(false);
	const [showToxicModal, setShowToxicModal] = useState(false);
	const [toxicResult, setToxicResult] = useState(null);

	useEffect(() => {
		if (post) {
			setEditData({
				content: post.content || "",
				images: post.images || [],
				videoUrl: post.videoUrl || null,
			});
			setNewImages([]);
			setNewVideo(null);
			setRemoveExistingVideo(false);
		}
	}, [post, isOpen]);

	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const imageUrl = e.target.result;
				setNewImages((prev) => [...prev, { imageUrl, file }]);
			};
			reader.readAsDataURL(file);
		});
	};

	const handleRemoveExistingImage = (index) => {
		setEditData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	const handleRemoveNewImage = (index) => {
		setNewImages((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle video upload with 5-minute limit client-side
	const handleVideoUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("video/")) return;

		const url = URL.createObjectURL(file);
		const tempVideo = document.createElement("video");
		tempVideo.preload = "metadata";
		tempVideo.src = url;
		tempVideo.onloadedmetadata = () => {
			const duration = tempVideo.duration;
			if (duration && duration > 300) {
				URL.revokeObjectURL(url);
				setNewVideo(null);
				alert("Video has to be 5 minutes or shorter.");
				e.target.value = "";
				return;
			}
			setNewVideo({ url, file, duration });
			// If selecting a new video, we implicitly replace existing
			setRemoveExistingVideo(false);
		};
		tempVideo.onerror = () => {
			URL.revokeObjectURL(url);
			setNewVideo(null);
			alert("Cannot read this video. Please try another file.");
			e.target.value = "";
		};
	};

	const handleSave = async () => {
		if (isSaving || isCheckingToxic) return;
		if (
			!editData.content.trim() &&
			newImages.length === 0 &&
			editData.images.length === 0 &&
			!newVideo &&
			!editData.videoUrl
		) {
			toast.error("Post cannot be empty!");
			return;
		}

		// Check toxic content first if content exists
		if (editData.content && editData.content.trim()) {
			setIsCheckingToxic(true);
			try {
				const toxicCheck = await checkToxicComment(editData.content);
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

		let updatedPost = {
			...post,
			content: editData.content,
			images: [...editData.images, ...newImages],
			videoUrl: removeExistingVideo
				? null
				: newVideo
				? null
				: editData.videoUrl,
		};
		const formData = new FormData();
		formData.append("id", post.id);
		formData.append("content", updatedPost?.content);
		if (updatedPost?.images && updatedPost.images.length > 0) {
			updatedPost.images.forEach((img) => {
				if (img.file) {
					formData.append("image", img.file);
				} else {
					formData.append("existingImages", img);
				}
			});
		}
		// Video fields
		if (newVideo?.file) {
			formData.append("video", newVideo.file);
		} else {
			// If remove flag is set, send empty to trigger deletion; else send existing to keep
			formData.append(
				"videoUrl",
				removeExistingVideo ? "" : editData.videoUrl || ""
			);
		}

		setIsSaving(true);
		try {
			let response = await UpdatePost(formData);
			updatedPost = {
				...post,
				content: response.post.content,
				images: JSON.parse(response.post.imageUrl) || [],
				videoUrl: response.post.videoUrl || null,
			};

			if (response && response.errCode === 0) {
				toast.success("Post updated successfully!");
				onUpdatePost(updatedPost);
				onClose();
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditData({
			content: post?.content || "",
			images: post?.images || [],
		});
		setNewImages([]);
		setNewVideo(null);
		setRemoveExistingVideo(false);
		onClose();
	};

	const ToxicModal = () => {
		return (
			<div
				className="edit-post-overlay"
				onClick={() => setShowToxicModal(false)}
			>
				<div
					className="edit-post-modal"
					onClick={(e) => e.stopPropagation()}
					style={{ maxWidth: "500px" }}
				>
					<div className="edit-post-header">
						<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
							<AlertTriangle size={24} color="#ef4444" />
							<h2>Toxic Content Detected</h2>
						</div>
						<button
							className="close-btn"
							onClick={() => setShowToxicModal(false)}
						>
							<X size={24} />
						</button>
					</div>
					<div className="edit-post-body">
						<p>
							We detected potentially toxic content in your post. Please review
							our community guidelines:
						</p>
						{toxicResult?.details && (
							<div style={{ marginBottom: "16px" }}>
								<strong>Content Issue:</strong>
								<span style={{ color: "#ef4444", marginLeft: "8px" }}>
									{JSON.stringify(toxicResult.details)}
								</span>
							</div>
						)}
						<div>
							<h4>Community Guidelines:</h4>
							<ul style={{ paddingLeft: "20px" }}>
								<li>Be respectful and kind to others</li>
								<li>No hate speech or harassment</li>
								<li>Avoid offensive or inflammatory language</li>
								<li>Keep discussions constructive and positive</li>
							</ul>
						</div>
					</div>
					<div className="edit-post-footer">
						<button
							className="save-btn"
							onClick={() => setShowToxicModal(false)}
						>
							I Understand
						</button>
					</div>
				</div>
			</div>
		);
	};

	if (!isOpen) return null;

	return (
		<>
			<div className="edit-post-overlay" onClick={handleCancel}>
				<div className="edit-post-modal" onClick={(e) => e.stopPropagation()}>
					<div className="edit-post-header">
						<h2>Edit Post</h2>
						<button className="close-btn" onClick={handleCancel}>
							<X size={24} />
						</button>
					</div>

					<div className="edit-post-body">
						<div className="form-group">
							<label className="form-label">Caption</label>
							<textarea
								className="form-textarea"
								value={editData.content}
								onChange={(e) =>
									setEditData((prev) => ({ ...prev, content: e.target.value }))
								}
								placeholder="What's on your mind?"
								rows={4}
							/>
						</div>

						<div className="form-group">
							<label className="form-label">Images</label>

							{/* Existing Images */}
							{editData.images.length > 0 && (
								<div className="images-section">
									<h4 className="images-subtitle">Current Images</h4>
									<div className="images-grid">
										{editData.images.map((image, index) => (
											<div key={index} className="image-item">
												<img src={image} alt={`Post ${index}`} />
												<button
													className="remove-image-btn"
													onClick={() => handleRemoveExistingImage(index)}
												>
													<Trash2 size={16} />
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* New Images */}
							{newImages.length > 0 && (
								<div className="images-section">
									<h4 className="images-subtitle">New Images</h4>
									<div className="images-grid">
										{newImages.map((image, index) => (
											<div key={index} className="image-item">
												<img src={image.imageUrl} alt={`New ${index}`} />
												<button
													className="remove-image-btn"
													onClick={() => handleRemoveNewImage(index)}
												>
													<Trash2 size={16} />
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Upload New Images */}
							<div className="upload-section">
								<input
									type="file"
									id="image-upload"
									multiple
									accept="image/*"
									onChange={handleImageUpload}
									className="file-input"
								/>
								<label htmlFor="image-upload" className="upload-btn">
									<Upload size={20} />
									Add Images
								</label>
							</div>
						</div>

						{/* Video Section - Only show if has video or can add video */}
						{(editData.videoUrl || newVideo || !removeExistingVideo) && (
							<div className="form-group" style={{ marginTop: 16 }}>
								<label className="form-label">Video</label>
								{editData.videoUrl && !removeExistingVideo && !newVideo && (
									<div className="images-section" style={{ marginBottom: 12 }}>
										<h4 className="images-subtitle">Current Video</h4>
										<div
											className="image-item"
											style={{ width: "100%", maxWidth: "none" }}
										>
											<video
												src={editData.videoUrl}
												controls
												style={{
													width: "100%",
													borderRadius: 8,
													maxHeight: 400,
													display: "block",
												}}
											/>
											<button
												type="button"
												className="remove-image-btn"
												onClick={() => setRemoveExistingVideo(true)}
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								)}
								{newVideo && (
									<div className="images-section" style={{ marginBottom: 12 }}>
										<h4 className="images-subtitle">
											New Video (Duration: {Math.round(newVideo.duration)}s)
										</h4>
										<div
											className="image-item"
											style={{ width: "100%", maxWidth: "none" }}
										>
											<video
												src={newVideo.url}
												controls
												style={{
													width: "100%",
													borderRadius: 8,
													maxHeight: 400,
													display: "block",
												}}
											/>
											<button
												type="button"
												className="remove-image-btn"
												onClick={() => {
													URL.revokeObjectURL(newVideo.url);
													setNewVideo(null);
												}}
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								)}

								<div className="upload-section">
									<input
										type="file"
										id="video-upload"
										accept="video/*"
										onChange={handleVideoUpload}
										className="file-input"
										ref={videoInputRef}
										style={{ display: "none" }}
									/>
									<label htmlFor="video-upload" className="upload-btn">
										<Video size={20} /> Add/Replace Video
									</label>
								</div>
							</div>
						)}
					</div>

					<div className="edit-post-footer">
						<button
							className="cancel-btn"
							onClick={handleCancel}
							disabled={isSaving || isCheckingToxic}
						>
							Cancel
						</button>
						<button
							className="save-btn"
							onClick={handleSave}
							disabled={isSaving || isCheckingToxic}
						>
							{isCheckingToxic
								? "Checking content..."
								: isSaving
								? "Saving..."
								: "Save Changes"}
						</button>
					</div>
				</div>
			</div>

			{/* Toxic Content Warning Modal */}
			{showToxicModal && <ToxicModal />}
		</>
	);
};

export default EditPost;
