import React, { useState } from "react";
import { UserPlus, Users, FileText } from "lucide-react";
import Post from "../../components/Post/Post";
import "./SearchResult.css";

const SearchResult = () => {
	const [activeTab, setActiveTab] = useState("posts");
	const [searchQuery] = useState("React"); // This would come from search params or props

	// Mock data for search results
	const [searchResultPosts] = useState([
		{
			id: 1,
			User: {
				fullName: "John Doe",
				username: "johndoe",
				profilePicture: "/api/placeholder/40/40",
			},
			content:
				"Just finished a great React project! The new hooks are amazing for state management. #React #JavaScript",
			images: ["/api/placeholder/400/300"],
			likes: 45,
			comments: [
				{
					id: 1,
					User: {
						fullName: "Jane Smith",
						username: "janesmith",
						profilePicture: "/api/placeholder/32/32",
					},
					content: "Looks awesome! Can you share the code?",
					likes: 2,
					timestamp: "2h ago",
					isLiked: false,
				},
			],
			shares: 8,
			timestamp: "3 hours ago",
		},
		{
			id: 2,
			User: {
				fullName: "Sarah Wilson",
				username: "sarahw",
				profilePicture: "/api/placeholder/40/40",
			},
			content:
				"React 18 features are incredible! The automatic batching and concurrent features make apps so much faster.",
			images: [],
			likes: 32,
			comments: [],
			shares: 5,
			timestamp: "5 hours ago",
		},
	]);

	const [searchResultPeople] = useState([
		{
			id: 1,
			fullName: "Alex Thompson",
			username: "alexthompson",
			profilePicture: "/api/placeholder/60/60",
			bio: "Frontend Developer | React Enthusiast",
			isFriend: false,
		},
		{
			id: 2,
			fullName: "Maria Garcia",
			username: "mariagarcia",
			profilePicture: "/api/placeholder/60/60",
			bio: "Full Stack Developer | React & Node.js",
			isFriend: false,
		},
		{
			id: 3,
			fullName: "David Chen",
			username: "davidchen",
			profilePicture: "/api/placeholder/60/60",
			bio: "Software Engineer | React Native Developer",
			isFriend: true,
		},
		{
			id: 4,
			fullName: "Emily Johnson",
			username: "emilyj",
			profilePicture: "/api/placeholder/60/60",
			bio: "UI/UX Designer | React Components",
			isFriend: false,
		},
	]);

	const [people, setPeople] = useState(searchResultPeople);

	const handleUpdatePost = (updatedPost) => {
		// Handle post updates if needed
		console.log("Updated post:", updatedPost);
	};

	const handleAddFriend = (personId) => {
		setPeople((prev) =>
			prev.map((person) =>
				person.id === personId
					? { ...person, isFriend: !person.isFriend }
					: person
			)
		);
	};

	const renderPosts = () => {
		if (searchResultPosts.length === 0) {
			return (
				<div className="no-results">
					<FileText size={48} className="no-results-icon" />
					<h3>No posts found</h3>
					<p>Try searching for different keywords.</p>
				</div>
			);
		}

		return (
			<div className="search-posts">
				{searchResultPosts.map((post) => (
					<Post key={post.id} post={post} onUpdatePost={handleUpdatePost} />
				))}
			</div>
		);
	};

	const renderPeople = () => {
		if (people.length === 0) {
			return (
				<div className="no-results">
					<Users size={48} className="no-results-icon" />
					<h3>No people found</h3>
					<p>Try searching for different names or usernames.</p>
				</div>
			);
		}

		return (
			<div className="search-people">
				{people.map((person) => (
					<div key={person.id} className="person-card">
						<div className="person-info">
							<div
								className="person-avatar"
								style={{
									backgroundImage: person.profilePicture ? `url(${person.profilePicture})` : 'none',
									backgroundSize: 'cover',
									backgroundPosition: 'center'
								}}
							>
								{!person.profilePicture && (
									<span className="avatar-placeholder">{person.fullName.charAt(0)}</span>
								)}
							</div>
							<div className="person-details">
								<h3 className="person-name">{person.fullName}</h3>
								<p className="person-username">@{person.username}</p>
								{person.bio && <p className="person-bio">{person.bio}</p>}
							</div>
						</div>
						<button
							className={`add-friend-btn ${person.isFriend ? "friends" : ""}`}
							onClick={() => handleAddFriend(person.id)}
						>
							<UserPlus size={16} />
							{person.isFriend ? "Friends" : "Add Friend"}
						</button>
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="search-result-container">
			{/* Search Header */}
			<div className="search-header">
				<h1 className="search-title">Search Results</h1>
				<p className="search-query">
					Showing results for "<span className="query-text">{searchQuery}</span>"
				</p>
			</div>

			{/* Search Tabs */}
			<div className="search-tabs">
				<button
					className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
					onClick={() => setActiveTab("posts")}
				>
					<FileText size={18} />
					Posts ({searchResultPosts.length})
				</button>
				<button
					className={`tab-button ${activeTab === "people" ? "active" : ""}`}
					onClick={() => setActiveTab("people")}
				>
					<Users size={18} />
					People ({people.length})
				</button>
			</div>

			{/* Tab Content */}
			<div className="search-content">
				{activeTab === "posts" ? renderPosts() : renderPeople()}
			</div>
		</div>
	);
};

export default SearchResult;
