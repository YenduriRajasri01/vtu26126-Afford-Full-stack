import React from 'react';
import { FiBell, FiLogOut } from 'react-icons/fi';
import './Header.css';

/**
 * Header Component
 * Displays the top navigation bar, logo, notifications counter badge, initials avatar, and logout action.
 */
export function Header({ unreadCount = 0, user = {}, onLogout }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="header-logo">
          <div className="logo-icon">🔔</div>
          <span className="logo-text">PulseNotify</span>
        </div>

        {/* Action Widgets */}
        <div className="header-actions">
          {/* Notification Bell Badge */}
          <div className="bell-badge-container" title={`${unreadCount} unread notifications`}>
            <FiBell className="bell-icon" />
            {unreadCount > 0 && (
              <span className="bell-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>

          {/* User Profile Card (Initials avatar only - photo removed) */}
          <div className="user-profile-widget" title={user.email || 'User'}>
            <div className="user-avatar-initials">{getInitials(user.name)}</div>
            <span className="user-name">{user.name || 'User'}</span>
          </div>

          {/* Logout Trigger */}
          <button 
            className="btn-logout" 
            onClick={onLogout} 
            title="Log out of application"
            aria-label="Logout"
          >
            <FiLogOut className="logout-icon" />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
