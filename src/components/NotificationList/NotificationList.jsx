import React from 'react';
import NotificationCard from '../NotificationCard/NotificationCard';
import SkeletonCard from '../Loader/SkeletonCard';
import { FiWifiOff, FiInbox, FiRefreshCw } from 'react-icons/fi';
import './NotificationList.css';

/**
 * NotificationList Component
 * Orchestrates the listing of notifications and manages skeleton loaders,
 * empty states, and connection failure overlays.
 */
export function NotificationList({
  notifications = [],
  loading = false,
  error = null,
  onCardClick,
  onToggleRead,
  onRetry
}) {
  // 1. Loading State
  if (loading) {
    return (
      <div className="notifications-list-container">
        {Array.from({ length: 5 }).map((_, idx) => (
          <SkeletonCard key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  // 2. Error State
  if (error) {
    const isNetworkError = error.message?.toLowerCase().includes('network') || error.code === 'ERR_NETWORK';
    return (
      <div className="notification-status-container error-state">
        <div className="status-graphic">
          <FiWifiOff className="status-icon error-icon" />
        </div>
        <h3>{isNetworkError ? 'Connection Lost' : 'Failed to Load'}</h3>
        <p className="status-desc">
          {isNetworkError
            ? 'We were unable to connect to the server. Please check your internet connection.'
            : error.message || 'A server-side error occurred while fetching notifications.'}
        </p>
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            <FiRefreshCw className="retry-spinner-icon" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (notifications.length === 0) {
    return (
      <div className="notification-status-container empty-state">
        <div className="status-graphic">
          <FiInbox className="status-icon empty-icon" />
        </div>
        <h3>No Notifications Available</h3>
        <p className="status-desc">
          There are no notifications matching your search or filters at the moment.
        </p>
        {onRetry && (
          <button className="btn-retry btn-sec" onClick={onRetry}>
            Refresh Page
          </button>
        )}
      </div>
    );
  }

  // 4. Data Listing State
  return (
    <div className="notifications-list-container">
      {notifications.map((notif) => (
        <NotificationCard
          key={notif.ID}
          notification={notif}
          onCardClick={onCardClick}
          onToggleRead={onToggleRead}
        />
      ))}
    </div>
  );
}

export default NotificationList;
