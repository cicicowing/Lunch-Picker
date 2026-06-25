import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-logo">🍽️ Lunch Picker</h1>
        <nav className="header-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/preferences">My Preferences</Link>
          <Link to="/suggestions">Vote</Link>
          <span className="header-user">👤 {user.name}</span>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
