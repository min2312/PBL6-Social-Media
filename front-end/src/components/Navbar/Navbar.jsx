import React, { useState } from 'react';
import { Search, Bell, Settings, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ title = "HomePage" }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchValue);
  };

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
        <div className="navbar-actions">
          <button className="navbar-button notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          <div className="user-menu-container">
            <button 
              className="user-avatar-btn"
              onClick={handleUserMenuToggle}
            >
              <div className="navbar-avatar">
                <span>JD</span>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-large">JD</div>
                  <div className="user-details">
                    <p className="user-name">John Doe</p>
                    <p className="user-email">john@example.com</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <a href="/profile" className="dropdown-item">
                  <Settings size={16} />
                  <span>Profile</span>
                </a>
                <a href="#" className="dropdown-item logout">
                  <LogOut size={16} />
                  <span>Logout</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default Navbar;
