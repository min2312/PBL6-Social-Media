import React, { useState, useEffect, useRef } from "react";
import "./Notification.css";

const Notification = ({ isOpen, onClose }) => {
	const dropdownRef = useRef(null);

	// Mock notification data - replace with actual API call
	const [notifications] = useState([
		{
			id: 1,
			avatar: "J",
			name: "John Doe",
			content: "liked your post",
			time: "5 min ago",
			isRead: false,
		},
		{
			id: 2,
			avatar: "S",
			name: "Sarah Wilson",
			content: "commented on your photo",
			time: "15 min ago",
			isRead: false,
		},
		{
			id: 3,
			avatar: "M",
			name: "Mike Johnson",
			content: "started following you",
			time: "1 h ago",
			isRead: true,
		},
		{
			id: 4,
			avatar: "A",
			name: "Anna Smith",
			content: "shared your post",
			time: "2 h ago",
			isRead: true,
		},
		{
			id: 5,
			avatar: "D",
			name: "David Brown",
			content: "mentioned you in a comment",
			time: "3 h ago",
			isRead: false,
		},
		{
			id: 6,
			avatar: "L",
			name: "Lisa Taylor",
			content: "liked your comment",
			time: "5 h ago",
			isRead: true,
		},
	]);

	const displayedNotifications = notifications.slice(0, 5);
	const hasMore = notifications.length > 5;

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

	return (
		<div
			className="notif-dropdown"
			ref={dropdownRef}
			onMouseDown={(e) => e.stopPropagation()}
		>
			<div className="notif-header">
				<h3>Notifications</h3>
			</div>
			
			<div className="notif-list">
				{displayedNotifications.map((notification) => (
					<div 
						key={notification.id} 
						className={`notif-item ${!notification.isRead ? 'notif-item--unread' : ''}`}
					>
						<div className="notif-avatar">
							{notification.avatar}
						</div>
						<div className="notif-content">
							<div className="notif-text">
								<span className="notif-name">{notification.name}</span>
								<span className="notif-action">{notification.content}</span>
							</div>
							<div className="notif-time">{notification.time}</div>
						</div>
						{!notification.isRead && <div className="notif-unread-indicator"></div>}
					</div>
				))}
			</div>

			{hasMore && (
				<div className="notif-footer">
					<button className="notif-see-more-btn">See more</button>
				</div>
			)}
		</div>
	);
};

export default Notification;
