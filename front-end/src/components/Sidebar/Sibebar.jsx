import React from 'react';
import { Home, MessageCircle, Heart, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'messenger', icon: MessageCircle, label: 'Messenger', path: '/messenger' },
    { id: 'favorites', icon: Heart, label: 'Favorites', path: '/favorites' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="logo-section">
          <div className="logo-icon">
            <span>B</span>
          </div>
          <span className="logo-text">Bird</span>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="user-profile">
          <button className="profile-button">
            <div className="user-avatar"></div>
            <span>Esmeralda</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
