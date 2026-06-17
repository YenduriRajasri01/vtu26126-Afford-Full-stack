import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import useNotifications from '../../hooks/useNotifications';
import Header from '../../components/Header/Header';
import StatisticsCards from '../../components/StatisticsCards/StatisticsCards';
import SearchBar from '../../components/SearchBar/SearchBar';
import Filters from '../../components/Filters/Filters';
import NotificationList from '../../components/NotificationList/NotificationList';
import Pagination from '../../components/Pagination/Pagination';
import PriorityNotifications from '../../components/PriorityNotifications/PriorityNotifications';
import Modal from '../../components/Modal/Modal';
import { logger } from '../../utils/logger';
import { FiCheckSquare, FiAlertCircle, FiX } from 'react-icons/fi';
import './Dashboard.css';

/**
 * Dashboard Component
 * Coordinates the full Notification Management Panel workspace.
 */
export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Auth Guard
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      logger.warn('Dashboard', 'User unauthenticated. Redirecting to Login.');
      navigate('/login', { replace: true });
    } else {
      const activeUser = authService.getUser();
      logger.log('Dashboard', 'User authenticated.', activeUser);
      setUser(activeUser);
    }
  }, [navigate]);

  // Hook integrations
  const {
    notifications,
    rawNotifications,
    loading,
    error,
    page,
    totalPages,
    limit,
    notificationType,
    searchQuery,
    unreadCount,
    stats,
    toast,
    clearToast,
    setPage,
    setLimit,
    setNotificationType,
    setSearchQuery,
    toggleReadStatus,
    markAllAsRead,
    retry
  } = useNotifications();

  // Selected Notification for Details Modal
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Active Toast notifications timeout ref
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  const handleLogout = () => {
    logger.log('Dashboard', 'Logging out user.');
    authService.logout();
    navigate('/login', { replace: true });
  };

  const handleCardClick = (notification) => {
    logger.log('Dashboard', 'Notification card clicked!', notification);
    setSelectedNotification(notification);
    
    // Mark as read immediately when clicked/viewed
    if (!notification.Read) {
      logger.log('Dashboard', `Marking notification ${notification.ID} as read on click.`);
      toggleReadStatus(notification.ID, true);
    }
  };

  const handleModalClose = () => {
    logger.log('Dashboard', 'Closing details modal.');
    setSelectedNotification(null);
  };

  // If user state is not resolved yet, prevent flash of unauthenticated template
  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-app-layout">
      {/* Top Navigation Header */}
      <Header unreadCount={unreadCount} user={user} onLogout={handleLogout} />

      {/* Main Content Workspace */}
      <main className="dashboard-main-content">
        <div className="dashboard-container">
          
          {/* Header Title Section */}
          <div className="dashboard-title-bar">
            <div>
              <h1 className="dashboard-main-heading">Notification Command Center</h1>
              <p className="dashboard-sub-heading">
                Monitor and process academic results, events, and job placement notifications.
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="btn-mark-all-read" onClick={markAllAsRead}>
                <FiCheckSquare />
                <span>Mark page as read</span>
              </button>
            )}
          </div>

          {/* Core Statistics Cards */}
          <StatisticsCards stats={stats} />

          {/* Split Workspace Layout */}
          <div className="dashboard-workspace-grid">
            
            {/* Left Main Column: Feeds, Filters, and Pagination */}
            <div className="workspace-feed-column">
              
              {/* Toolbar controls */}
              <div className="workspace-toolbar">
                <div className="toolbar-search-wrapper">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
                <div className="toolbar-filters-wrapper">
                  <Filters
                    selectedType={notificationType}
                    onTypeChange={(type) => {
                      setNotificationType(type);
                      setPage(1); // Reset page on category filter change
                    }}
                  />
                </div>
              </div>

              {/* Feed Card List */}
              <NotificationList
                notifications={notifications}
                loading={loading}
                error={error}
                onCardClick={handleCardClick}
                onToggleRead={toggleReadStatus}
                onRetry={retry}
              />

              {/* Pagination controls */}
              {!loading && !error && notifications.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1); // Reset page to 1 on limit adjust
                  }}
                />
              )}
            </div>

            {/* Right Sidebar Column: Priority Heap Sorting */}
            <div className="workspace-sidebar-column">
              <PriorityNotifications
                notifications={rawNotifications}
                onCardClick={handleCardClick}
                onToggleRead={toggleReadStatus}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      <Modal
        isOpen={selectedNotification !== null}
        notification={selectedNotification}
        onClose={handleModalClose}
      />

      {/* Custom Sliding Toast Alert */}
      {toast && (
        <div className="toast-notification-banner animate-slide-in" onClick={clearToast}>
          <div className="toast-icon-side">
            <FiAlertCircle />
          </div>
          <div className="toast-body-side">
            <h4 className="toast-title">New Event Logged</h4>
            <p className="toast-msg">{toast.message}</p>
          </div>
          <button className="toast-close" onClick={(e) => { e.stopPropagation(); clearToast(); }} aria-label="Close toast">
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
