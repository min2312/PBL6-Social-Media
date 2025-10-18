import React, { useState } from "react";
import {
    Users,
    FileText,
    TrendingUp,
    AlertCircle,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Ban,
    CheckCircle,
} from "lucide-react";
import "./Admin.css";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data cho users
    const [users, setUsers] = useState([
        {
            id: 1,
            fullName: "John Doe",
            email: "john@example.com",
            role: "user",
            status: "active",
            trustScore: 85,
            createdAt: "2024-01-15",
            posts: 45,
        },
        {
            id: 2,
            fullName: "Jane Smith",
            email: "jane@example.com",
            role: "user",
            status: "active",
            trustScore: 92,
            createdAt: "2024-02-20",
            posts: 67,
        },
        {
            id: 3,
            fullName: "Mike Johnson",
            email: "mike@example.com",
            role: "user",
            status: "suspended",
            trustScore: 45,
            createdAt: "2024-03-10",
            posts: 23,
        },
        {
            id: 4,
            fullName: "Sarah Williams",
            email: "sarah@example.com",
            role: "user",
            status: "active",
            trustScore: 78,
            createdAt: "2024-01-25",
            posts: 56,
        },
    ]);

    // Mock data cho posts
    const [posts, setPosts] = useState([
        {
            id: 1,
            userId: 1,
            userName: "John Doe",
            content: "Just finished my first React project! 🚀",
            imageUrl: ["https://picsum.photos/400/300"],
            isBlocked: false,
            likes: 45,
            comments: 12,
            createdAt: "2024-03-15T10:30:00",
            scope: "public",
        },
        {
            id: 2,
            userId: 2,
            userName: "Jane Smith",
            content: "Beautiful sunset today 🌅",
            imageUrl: ["https://picsum.photos/400/301"],
            isBlocked: false,
            likes: 23,
            comments: 5,
            createdAt: "2024-03-16T14:20:00",
            scope: "public",
        },
        {
            id: 3,
            userId: 3,
            userName: "Mike Johnson",
            content: "This is inappropriate content",
            imageUrl: [],
            isBlocked: true,
            likes: 2,
            comments: 0,
            createdAt: "2024-03-14T09:15:00",
            scope: "public",
        },
        {
            id: 4,
            userId: 4,
            userName: "Sarah Williams",
            content: "New blog post about web development! Check it out",
            imageUrl: ["https://picsum.photos/400/302"],
            isBlocked: false,
            likes: 89,
            comments: 34,
            createdAt: "2024-03-13T16:45:00",
            scope: "public",
        },
    ]);

    // Statistics
    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === "active").length,
        totalPosts: posts.length,
        pendingPosts: posts.filter((p) => p.isBlocked).length,
    };

    // User actions
    const handleSuspendUser = (userId) => {
        setUsers(
            users.map((user) =>
                user.id === userId ? { ...user, status: "suspended" } : user
            )
        );
    };

    const handleActivateUser = (userId) => {
        setUsers(
            users.map((user) =>
                user.id === userId ? { ...user, status: "active" } : user
            )
        );
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter((user) => user.id !== userId));
        }
    };

    // Post actions
    const handleToggleBlockPost = (postId) => {
        setPosts(
            posts.map((post) =>
                post.id === postId
                    ? { ...post, isBlocked: !post.isBlocked }
                    : post
            )
        );
    };

    const handleDeletePost = (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            setPosts(posts.filter((post) => post.id !== postId));
        }
    };

    // Filter data based on search
    const filteredUsers = users.filter(
        (user) =>
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPosts = posts.filter(
        (post) =>
            post.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage users and posts</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.activeUsers}</h3>
                        <p>Active Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon posts">
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalPosts}</h3>
                        <p>Total Posts</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.pendingPosts}</h3>
                        <p>Blocked Posts</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    <Users size={18} />
                    Users Management
                </button>
                <button
                    className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
                    onClick={() => setActiveTab("posts")}
                >
                    <FileText size={18} />
                    Posts Management
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {activeTab === "users" ? (
                <div className="users-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Trust Score</th>
                                <th>Posts</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar-small">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <span>{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`status-badge ${user.status}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="trust-score">
                                            <div className="trust-bar">
                                                <div
                                                    className="trust-fill"
                                                    style={{ width: `${user.trustScore}%` }}
                                                ></div>
                                            </div>
                                            <span>{user.trustScore}%</span>
                                        </div>
                                    </td>
                                    <td>{user.posts}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {user.status === "active" ? (
                                                <button
                                                    className="action-btn suspend"
                                                    onClick={() => handleSuspendUser(user.id)}
                                                    title="Suspend User"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-btn activate"
                                                    onClick={() => handleActivateUser(user.id)}
                                                    title="Activate User"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteUser(user.id)}
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="posts-grid">
                    {filteredPosts.map((post) => (
                        <div key={post.id} className="admin-post-card">
                            <div className="post-header">
                                <div className="post-user">
                                    <div className="user-avatar-small">
                                        {post.userName.charAt(0)}
                                    </div>
                        <div>
                            <p className="user-name">{post.userName}</p>
                            <p className="post-date">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <span className={`status-badge ${post.isBlocked ? 'blocked' : 'active'}`}>
                        {post.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                </div>                            <div className="post-content">
                                <p>{post.content}</p>
                                {post.imageUrl && post.imageUrl.length > 0 && (
                                    <div className="post-image">
                                        <img src={post.imageUrl[0]} alt="Post" />
                                    </div>
                                )}
                            </div>

                            <div className="post-stats">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.comments}</span>
                                <span>👁️ {post.scope}</span>
                            </div>

                            <div className="post-actions">
                                <button
                                    className={`action-btn ${post.isBlocked ? 'activate' : 'suspend'}`}
                                    onClick={() => handleToggleBlockPost(post.id)}
                                >
                                    {post.isBlocked ? (
                                        <>
                                            <CheckCircle size={16} />
                                            Unblock
                                        </>
                                    ) : (
                                        <>
                                            <Ban size={16} />
                                            Block
                                        </>
                                    )}
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDeletePost(post.id)}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admin;