import React from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import "./DeletePost.css";

const DeletePost = ({ isOpen, onClose, onConfirm, post }) => {
	if (!isOpen) return null;

	const handleConfirm = () => {
		onConfirm(post);
		onClose();
	};

	return (
		<div className="delete-post-overlay" onClick={onClose}>
			<div className="delete-post-modal" onClick={(e) => e.stopPropagation()}>
				<div className="delete-post-header">
					<div className="delete-warning">
						<AlertTriangle size={24} className="warning-icon" />
						<h2>Delete Post</h2>
					</div>
					<button className="close-btn" onClick={onClose}>
						<X size={24} />
					</button>
				</div>

				<div className="delete-post-body">
					<p className="delete-message">
						Are you sure you want to delete this post? This action cannot be undone.
					</p>
					
					{/* Post preview */}
					<div className="post-preview">
						<p className="preview-content">
							{post?.content && post.content.length > 100 
								? `${post.content.substring(0, 100)}...` 
								: post?.content}
						</p>
						{post?.images && post.images.length > 0 && (
							<div className="preview-images">
								<span className="image-count">
									{post.images.length} image{post.images.length > 1 ? 's' : ''}
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="delete-post-footer">
					<button className="cancel-btn" onClick={onClose}>
						Cancel
					</button>
					<button className="delete-btn" onClick={handleConfirm}>
						<Trash2 size={16} />
						Delete Post
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeletePost;
