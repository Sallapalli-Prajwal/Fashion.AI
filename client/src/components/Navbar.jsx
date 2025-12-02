import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">👔</span>
          OutfitVision
        </Link>
        
        <div className="navbar-links">
          <Link 
            to="/dashboard" 
            className={isActive('/dashboard') ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link 
            to="/gallery" 
            className={isActive('/gallery') ? 'active' : ''}
          >
            Gallery
          </Link>
          <Link 
            to="/analytics" 
            className={isActive('/analytics') ? 'active' : ''}
          >
            Analytics
          </Link>
          <Link 
            to="/profile" 
            className={isActive('/profile') ? 'active' : ''}
          >
            Profile
          </Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name || user?.email}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

