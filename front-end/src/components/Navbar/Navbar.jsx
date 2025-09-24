import React from 'react';
import { Search } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ title = "HomePage" }) => {
  return (
    <div className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-title">{title}</h1>
        <div className="navbar-actions">
          <button className="navbar-button">
            <Search size={20} />
          </button>
          <div className="navbar-avatar"></div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
