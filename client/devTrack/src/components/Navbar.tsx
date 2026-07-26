import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, serverStatus, activeView, setActiveView, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="nav-header">
      <div className="nav-container">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveView('landing')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="brand-name">Dev<span className="brand-highlight">Track</span></span>
        </div>

        {/* Links */}
        <div className="nav-links">
          <button
            className={`nav-item ${activeView === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveView('landing')}
          >
            Home
          </button>
          
          {user && (
            <button
              className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveView('profile')}
            >
              Dashboard & Profile
            </button>
          )}

          <button
            className={`nav-item ${activeView === 'console' ? 'active' : ''}`}
            onClick={() => setActiveView('console')}
          >
            API Console
          </button>
        </div>

        {/* Right Section */}
        <div className="nav-right">
          <span className={`status-pill ${serverStatus ? 'online' : 'offline'}`} title="Backend API Health">
            <span className="dot"></span>
            {serverStatus ? 'Server Live' : 'Offline'}
          </span>

          {user ? (
            <div className="user-menu-wrapper" style={{ position: 'relative' }}>
              <div
                className="user-badge"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="nav-avatar" />
                ) : (
                  <div className="nav-avatar-placeholder">{user.name?.charAt(0) || 'U'}</div>
                )}
                <span className="nav-username">{user.name || user.email}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setActiveView('profile');
                      setDropdownOpen(false);
                    }}
                  >
                    👤 My Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setActiveView('console');
                      setDropdownOpen(false);
                    }}
                  >
                    🛠️ API Inspector
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    🚪 Logout ({user.provider})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setActiveView('auth')}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
