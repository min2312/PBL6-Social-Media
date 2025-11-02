import React, { useEffect, useRef } from "react";
import "./Notification.css";
import { useNotifications } from "../../Context/NotificationContext";

const Notification = ({ isOpen, onClose }) => {
	const dropdownRef = useRef(null);
	const { notifications = [], unread = 0 } = useNotifications();

	const displayedNotifications = Array.isArray(notifications)
		? notifications
		: [];
	// removed: const hasMore = Array.isArray(notifications) && notifications.length > 5;

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	const formatTime = (dateStr) => {
		if (!dateStr) return "";
		const diffMs = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diffMs / 60000);
		if (mins < 1) return "just now";
		if (mins < 60) return `${mins} min ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours} h ago`;
		const days = Math.floor(hours / 24);
		return `${days} d ago`;
	};

	return (
		<div
			className="notif-dropdown"
			ref={dropdownRef}
			onMouseDown={(e) => e.stopPropagation()}
		>
			<div className="notif-header">
				<h3>Notifications</h3>
				{/* {unread > 0 && <span className="notif-unread-badge">{unread}</span>} */}
			</div>

			<div className="notif-list">
				{displayedNotifications.map((n) => {
					const sender = n?.sender;
					const avatarUrl = sender?.profilePicture;
					const name = sender?.fullName || "Someone";
					const actionText = n?.content || n?.title || "";
					const timeText = formatTime(n?.createdAt);
					const isUnread = n?.isRead === false;

					return (
						<div key={n.id} className={`notif-item ${isUnread ? "notif-item--unread" : ""}`}>
							<div className="notif-avatar">
								{avatarUrl ? (
									<img src={avatarUrl} alt={name} className="notif-avatar-img" />
								) : (
									(name?.[0] || "?").toUpperCase()
								)}
							</div>
							<div className="notif-content">
								<div className="notif-text">
									<span className="notif-name">{name}</span>
									<span className="notif-action">{actionText}</span>
								</div>
								<div className="notif-time">{timeText}</div>
							</div>
							{isUnread && <div className="notif-unread-indicator"></div>}
						</div>
					);
				})}
				{displayedNotifications.length === 0 && (
					<div className="notif-empty">No notifications</div>
				)}
			</div>

			{/* removed "See more" footer */}
		</div>
	);
};

export default Notification;
