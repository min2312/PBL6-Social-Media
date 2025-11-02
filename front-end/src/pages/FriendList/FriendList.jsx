import React, { useState, useContext, useEffect } from "react";
import { UserPlus, UserCheck, UserX, Users } from "lucide-react";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";
import {
	getAllFriendships,
	sendFriendRequest,
	cancelFriendRequest,
} from "../../services/socialService";
import "./FriendList.css";
import useSmartRelativeTime from "../../hook/useSmartRelativeTime";
import { io } from "socket.io-client";
import { useHistory } from "react-router-dom";

const FriendList = () => {
	const [activeTab, setActiveTab] = useState("friends");
	const [friends, setFriends] = useState([]);
	const [friendRequests, setFriendRequests] = useState([]);
	const [socket, setSocket] = useState(null);
	const { user } = useContext(UserContext);
	const history = useHistory();
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

	const load = async () => {
		if (!user || !user.account) return;
		try {
			const res = await getAllFriendships(user.account.id);
			if (res && res.errCode === 0) {
				const list = res.friendships || [];
				const mapBasic = (u) => ({
					id: u.id,
					fullName: u.fullName,
					avatar: u.profilePicture || "",
					email: u.email,
					friendshipStatus: u.friendshipStatus,
					createdAt: u.createdAt,
				});
				setFriends(
					list.filter((u) => u.friendshipStatus === "friends").map(mapBasic)
				);
				setFriendRequests(
					list
						.filter((u) => u.friendshipStatus === "they_sent_request")
						.map(mapBasic)
				);
			} else {
				setFriends([]);
				setFriendRequests([]);
			}
		} catch (e) {
			setFriends([]);
			setFriendRequests([]);
		}
	};

	useEffect(() => {
		load();
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

		newSocket.on("connect", () => {});

		newSocket.on(
			"friendRequestReceived",
			({ data, toUserId, friendshipStatus }) => {
				if (toUserId === user.account.id) return;
				if (friendshipStatus === "they_sent_request" && data) {
					const newFriendRequest = {
						...data,
						createdAt: new Date().toISOString(),
					};
					setFriendRequests((prev) => [newFriendRequest, ...prev]);
				}
				if (friendshipStatus === "none") {
					setFriends((prev) => prev.filter((friend) => friend.id !== toUserId));
					setFriendRequests((prev) =>
						prev.filter((req) => req.id !== toUserId)
					);
				}
				if (friendshipStatus === "friends" && data) {
					const accepted = {
						...data,
						avatar: data.profilePicture || "",
						friendshipStatus: friendshipStatus,
					};
					setFriends((prev) => [...prev, accepted]);
				}
			}
		);

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

	const handleAcceptRequest = async (requestId) => {
		try {
			const res = await sendFriendRequest(
				user.account.id,
				requestId,
				"accepted"
			);
			if (res && res.errCode === 0) {
				// move from requests to friends
				socket.emit("sendFriendRequest", {
					data: user.account,
					toUserId: user.account.id,
					friendshipStatus: "friends",
				});
				const accepted = friendRequests.find((r) => r.id === requestId);
				setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
				if (accepted) setFriends((prev) => [...prev, accepted]);
				toast.success("Friend request accepted!");
			} else {
				toast.error(res?.errMessage || "Failed to accept friend request");
			}
		} catch (error) {
			toast.error("Failed to accept friend request");
		}
	};

	const handleDeclineRequest = async (requestId) => {
		try {
			const res = await sendFriendRequest(user.account.id, requestId, "reject");
			if (res && res.errCode === 0) {
				socket.emit("sendFriendRequest", {
					toUserId: user.account.id,
					friendshipStatus: "none",
				});
				setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
				toast.success("Friend request declined");
			} else {
				toast.error(res?.errMessage || "Failed to decline friend request");
			}
		} catch (error) {
			toast.error("Failed to decline friend request");
		}
	};

	const handleRemoveFriend = async (friendId) => {
		try {
			const res = await cancelFriendRequest(user.account.id, friendId);
			if (res && res.errCode === 0) {
				socket.emit("sendFriendRequest", {
					toUserId: user.account.id,
					friendshipStatus: "none",
				});
				setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
				toast.success("Friend removed");
			} else {
				toast.error(res?.errMessage || "Failed to remove friend");
			}
		} catch (error) {
			toast.error("Failed to remove friend");
		}
	};

	const handleNavigateToProfile = (userId) => {
		history.push(`/profile/${userId}`);
	};

	const FriendCard = ({ person, type }) => {
		const requestDate = useSmartRelativeTime(person.createdAt, formatTimeAgo);
		return (
			<div className="friend-card">
				<div
					className="friend-info clickable"
					onClick={() => handleNavigateToProfile(person.id)}
				>
					<div className="friend-avatar">
						{person.avatar ? (
							<img src={person.avatar} alt={person.fullName} />
						) : (
							<div className="friend-avatar-placeholder">
								{person.fullName.charAt(0).toUpperCase()}
							</div>
						)}
					</div>
					<div className="friend-details">
						<h3 className="friend-name">{person.fullName}</h3>
						{type === "request" && requestDate && (
							<span className="friend-request-date">Requested {requestDate}</span>
						)}
					</div>
				</div>
				<div className="friend-actions">
					{type === "friend" ? (
						<button
							className="friend-btn friend-btn--secondary"
							onClick={() => handleRemoveFriend(person.id)}
						>
							<UserX size={16} />
							Remove
						</button>
					) : (
						<div className="friend-request-actions">
							<button
								className="friend-btn friend-btn--primary"
								onClick={() => handleAcceptRequest(person.id)}
							>
								<UserCheck size={16} />
								Accept
							</button>
							<button
								className="friend-btn friend-btn--danger"
								onClick={() => handleDeclineRequest(person.id)}
							>
								<UserX size={16} />
								Decline
							</button>
						</div>
					)}
				</div>
			</div>
		);
	};
	if (!user || !user.isAuthenticated) {
		return (
			<div className="content-wrapper">
				<div className="friend-auth-required">
					<p>Please log in to view your friends</p>
				</div>
			</div>
		);
	}

	return (
		<div className="content-wrapper">
			<div className="friend-list-container">
				<div className="friend-list-header">
					<h1>
						<Users size={24} />
						Friends
					</h1>
					<div className="friend-tab-navigation">
						<button
							className={`friend-tab-btn ${activeTab === "friends" ? "friend-tab-btn--active" : ""}`}
							onClick={() => setActiveTab("friends")}
						>
							All Friends ({friends.length})
						</button>
						<button
							className={`friend-tab-btn ${activeTab === "requests" ? "friend-tab-btn--active" : ""}`}
							onClick={() => setActiveTab("requests")}
						>
							Friend Requests ({friendRequests.length})
						</button>
					</div>
				</div>

				<div className="friend-list-content">
					{activeTab === "friends" ? (
						<div className="friend-grid">
							{friends.length > 0 ? (
								friends.map((friend) => (
									<FriendCard key={friend.id} person={friend} type="friend" />
								))
							) : (
								<div className="friend-empty-state">
									<Users size={48} />
									<h3>No friends yet</h3>
									<p>Start connecting with people to see them here!</p>
								</div>
							)}
						</div>
					) : (
						<div className="friend-grid">
							{friendRequests.length > 0 ? (
								friendRequests.map((request) => (
									<FriendCard
										key={request.id}
										person={request}
										type="request"
									/>
								))
							) : (
								<div className="friend-empty-state">
									<UserPlus size={48} />
									<h3>No friend requests</h3>
									<p>You're all caught up with friend requests!</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FriendList;
