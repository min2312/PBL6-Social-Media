import React, { useState, useContext, useEffect } from "react";
import { UserPlus, UserCheck, UserX, Users } from "lucide-react";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";
import "./FriendList.css";

const FriendList = () => {
	const [activeTab, setActiveTab] = useState("friends");
	const [friends, setFriends] = useState([]);
	const [friendRequests, setFriendRequests] = useState([]);
	const { user } = useContext(UserContext);

	// Mock data - replace with actual API calls
	useEffect(() => {
		// Mock friends data
		setFriends([
			{
				id: 1,
				fullName: "John Doe",
				avatar: "/api/placeholder/40/40",
				mutualFriends: 5
			},
			{
				id: 2,
				fullName: "Jane Smith",
				avatar: "/api/placeholder/40/40",
				mutualFriends: 3
			},
			{
				id: 3,
				fullName: "Mike Johnson",
				avatar: "/api/placeholder/40/40",
				mutualFriends: 8
			}
		]);

		// Mock friend requests data
		setFriendRequests([
			{
				id: 4,
				fullName: "Alice Wilson",
				avatar: "/api/placeholder/40/40",
				mutualFriends: 2,
				requestDate: "2 days ago"
			},
			{
				id: 5,
				fullName: "Bob Brown",
				avatar: "/api/placeholder/40/40",
				mutualFriends: 1,
				requestDate: "1 week ago"
			}
		]);
	}, []);

	const handleAcceptRequest = async (requestId) => {
		try {
			// API call to accept friend request
			setFriendRequests(prev => prev.filter(req => req.id !== requestId));
			toast.success("Friend request accepted!");
		} catch (error) {
			toast.error("Failed to accept friend request");
		}
	};

	const handleDeclineRequest = async (requestId) => {
		try {
			// API call to decline friend request
			setFriendRequests(prev => prev.filter(req => req.id !== requestId));
			toast.success("Friend request declined");
		} catch (error) {
			toast.error("Failed to decline friend request");
		}
	};

	const handleRemoveFriend = async (friendId) => {
		try {
			// API call to remove friend
			setFriends(prev => prev.filter(friend => friend.id !== friendId));
			toast.success("Friend removed");
		} catch (error) {
			toast.error("Failed to remove friend");
		}
	};

	const FriendCard = ({ person, type }) => (
		<div className="fl-friend-card">
			<div className="fl-friend-info">
				<div className="fl-friend-avatar">
					{person.avatar ? (
						<img src={person.avatar} alt={person.fullName} />
					) : (
						<div className="fl-avatar-placeholder">
							{person.fullName.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				<div className="fl-friend-details">
					<h3 className="fl-friend-name">{person.fullName}</h3>
					<span className="fl-mutual-friends">
						{person.mutualFriends} mutual friends
					</span>
					{type === "request" && (
						<span className="fl-request-date">Requested {person.requestDate}</span>
					)}
				</div>
			</div>
			<div className="fl-friend-actions">
				{type === "friend" ? (
					<button
						className="fl-btn-secondary"
						onClick={() => handleRemoveFriend(person.id)}
					>
						<UserX size={16} />
						Remove
					</button>
				) : (
					<div className="fl-request-actions">
						<button
							className="fl-btn-primary"
							onClick={() => handleAcceptRequest(person.id)}
						>
							<UserCheck size={16} />
							Accept
						</button>
						<button
							className="fl-btn-danger"
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

	if (!user || !user.isAuthenticated) {
		return (
			<div className="content-wrapper">
				<div className="fl-auth-required">
					<p>Please log in to view your friends</p>
				</div>
			</div>
		);
	}

	return (
		<div className="content-wrapper">
			<div className="fl-friend-list-container">
				<div className="fl-friend-list-header">
					<h1>
						<Users size={24} />
						Friends
					</h1>
					<div className="fl-tab-navigation">
						<button
							className={`fl-tab-btn ${activeTab === "friends" ? "active" : ""}`}
							onClick={() => setActiveTab("friends")}
						>
							All Friends ({friends.length})
						</button>
						<button
							className={`fl-tab-btn ${activeTab === "requests" ? "active" : ""}`}
							onClick={() => setActiveTab("requests")}
						>
							Friend Requests ({friendRequests.length})
						</button>
					</div>
				</div>

				<div className="fl-friend-list-content">
					{activeTab === "friends" ? (
						<div className="fl-friends-grid">
							{friends.length > 0 ? (
								friends.map(friend => (
									<FriendCard
										key={friend.id}
										person={friend}
										type="friend"
									/>
								))
							) : (
								<div className="fl-empty-state">
									<Users size={48} />
									<h3>No friends yet</h3>
									<p>Start connecting with people to see them here!</p>
								</div>
							)}
						</div>
					) : (
						<div className="fl-requests-grid">
							{friendRequests.length > 0 ? (
								friendRequests.map(request => (
									<FriendCard
										key={request.id}
										person={request}
										type="request"
									/>
								))
							) : (
								<div className="fl-empty-state">
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
