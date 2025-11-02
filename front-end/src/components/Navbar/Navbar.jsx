import React, { useContext, useState } from "react";
import { Search, Bell, Settings, LogOut, LogIn } from "lucide-react";
import "./Navbar.css";
import { UserContext } from "../../Context/UserProvider";
import { useNotifications } from "../../Context/NotificationContext";
import {
	useHistory,
	useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { LogOutUser } from "../../services/userService";
import { toast } from "react-toastify";
import Notification from "../Notification/Notification";


const Navbar = ({ title = "HomePage" }) => {
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const { user, logoutContext } = useContext(UserContext);
	const { notifications = [], unread = 0 } = useNotifications();
	const history = useHistory();
	const location = useLocation();
	const handleNotificationToggle = () => {
		setShowNotifications(prev => !prev);
		setShowUserMenu(false); // Close user menu when opening notifications
	};

	const handleUserMenuToggle = () => {
		setShowUserMenu(!showUserMenu);
		setShowNotifications(false); // Close notifications when opening user menu
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchValue.trim()) {
			history.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
		}
	};

	const handleLogout = async () => {
		let data = await LogOutUser();
		logoutContext();
		if (data && data.errCode === 0) {
			history.push("/");
			toast.success("Log out success");
		} else {
			toast.error(data.errMessage);
		}
	};

	if (
		location.pathname === "/reset-password" ||
		location.pathname === "/login_admin" ||
		location.pathname === "/login" ||
		location.pathname === "/register" ||
		location.pathname === "/admin"
	) {
		return null;
	}

	return (
		<div className="navbar">
			<div className="navbar-content">
				{/* Logo/Brand Section */}
				<div className="navbar-brand">
					<div className="brand-logo">📱</div>
					<span className="brand-name">SocialHub</span>
				</div>

				{/* Search Bar */}
				<form className="navbar-search" onSubmit={handleSearch}>
					<div className="search-container">
						<Search size={18} className="search-icon" />
						<input
							type="text"
							placeholder="Search people, posts..."
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							className="search-input"
						/>
					</div>
				</form>

				{/* Right Actions */}
				{user && user.isAuthenticated ? (
					<div className="navbar-actions">
						<div className="notification-container">
							<button
								className="navbar-button notification-btn"
								onMouseDown={(e) => e.stopPropagation()}
								onClick={handleNotificationToggle}
							>
								<Bell size={20} />
								<span className="notification-badge">{unread}</span>
							</button>

							{showNotifications && (
								<Notification
									isOpen={showNotifications}
									onClose={() => setShowNotifications(false)}
								/>
							)}
						</div>

						<div className="user-menu-container">
							<button
								className="user-avatar-btn"
								onClick={handleUserMenuToggle}
							>
								<div className="navbar-avatar">
									<span>{user?.account?.fullName.charAt(0)}</span>
								</div>
							</button>

							{showUserMenu && (
								<div className="user-dropdown">
									<div className="user-info">
										<div className="user-avatar-large">
											{user?.account?.fullName.charAt(0)}
										</div>
										<div className="user-details">
											<p className="user-name">{user?.account?.fullName}</p>
											<p className="user-email">{user?.account?.email}</p>
										</div>
									</div>
									<div className="dropdown-divider"></div>
									<a
										href={`/profile/${user.account.id}`}
										className="dropdown-item"
									>
										<Settings size={16} />
										<span>Profile</span>
									</a>
									<div
										onClick={handleLogout}
										className="dropdown-item logout"
										style={{ cursor: "pointer" }}
									>
										<LogOut size={16} />
										<span>Logout</span>
									</div>
								</div>
							)}
						</div>
					</div>
				) : (
					<div
						onClick={() => {
							history.push("/login");
						}}
						className="navbar-button login-btn"
					>
						<LogIn size={18} />
						<span>Login</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default Navbar;
