import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { logger } from '../utils/logger';

const READ_IDS_KEY = 'nms_read_notification_ids';
const DEFAULT_FILTER_KEY = 'nms_default_filter_category';

/**
 * useNotifications Hook
 * Manages the state, fetching, polling, searching, filtering, and read status of notifications.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Query parameters - initialize notificationType from localStorage selection (if any)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [notificationType, setNotificationType] = useState(() => {
    return localStorage.getItem(DEFAULT_FILTER_KEY) || '';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Total pages count (mocked/calculated since API returns array)
  const [totalPages, setTotalPages] = useState(1);

  // Local storage read state
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(READ_IDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newNotificationToast, setNewNotificationToast] = useState(null);
  const seenIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Sync readIds to localStorage
  useEffect(() => {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(readIds));
  }, [readIds]);

  /**
   * Fetches notifications from the API.
   */
  const fetchNotifications = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    setError(null);

    logger.log('useNotifications', isPolling ? 'Running background polling cycle' : 'Initiating fresh fetch', {
      page,
      limit,
      notificationType
    });

    try {
      const params = {
        page,
        limit,
      };

      if (notificationType) {
        params.notification_type = notificationType;
      }

      const response = await axiosInstance.get('/notifications', { params });
      
      let rawNotifications = [];
      if (response.data && Array.isArray(response.data.notifications)) {
        rawNotifications = response.data.notifications;
      } else if (Array.isArray(response.data)) {
        rawNotifications = response.data;
      }

      // Format data: Add local read flag
      const formatted = rawNotifications.map((notif) => ({
        ...notif,
        Read: readIds.includes(notif.ID),
      }));

      // Detect new notifications for Toast alerts during background updates
      if (!isInitialLoadRef.current && formatted.length > 0) {
        const newlyArrived = formatted.filter((n) => !seenIdsRef.current.has(n.ID));
        if (newlyArrived.length > 0) {
          logger.log('useNotifications', 'Detected newly arrived notifications during polling!', {
            count: newlyArrived.length
          });
          setNewNotificationToast({
            count: newlyArrived.length,
            message: newlyArrived.length === 1 
              ? `New Notification: "${newlyArrived[0].Message.substring(0, 30)}..."`
              : `${newlyArrived.length} new notifications received.`,
            timestamp: Date.now()
          });
        }
      }

      // Add to seen list
      formatted.forEach((n) => seenIdsRef.current.add(n.ID));
      isInitialLoadRef.current = false;

      // Update notifications state
      setNotifications(formatted);

      if (formatted.length === limit) {
        setTotalPages(page + 1);
      } else if (formatted.length < limit) {
        setTotalPages(page);
      } else {
        setTotalPages(Math.ceil(formatted.length / limit));
      }

    } catch (err) {
      if (!isPolling) {
        setError(err);
      }
      logger.error('useNotifications', 'Failed to retrieve notifications from endpoint', err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [page, limit, notificationType, readIds]);

  // Fetch when page, limit, or filter parameters adjust
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  // Real-time polling: Every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  /**
   * Action: Toggle notification read/unread status
   */
  const toggleReadStatus = useCallback((id, isRead) => {
    logger.log('useNotifications', `Toggling read status for ID: ${id}`, { isRead });
    
    setReadIds((prev) => {
      if (isRead) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      } else {
        return prev.filter((item) => item !== id);
      }
    });

    setNotifications((prev) =>
      prev.map((notif) => (notif.ID === id ? { ...notif, Read: isRead } : notif))
    );
  }, []);

  /**
   * Action: Mark all current notifications as read
   */
  const markAllAsRead = useCallback(() => {
    logger.log('useNotifications', 'Marking all loaded notifications as read.');
    const unreadCurrentIds = notifications
      .filter((n) => !n.Read)
      .map((n) => n.ID);

    if (unreadCurrentIds.length === 0) return;

    setReadIds((prev) => [...new Set([...prev, ...unreadCurrentIds])]);
    setNotifications((prev) => prev.map((notif) => ({ ...notif, Read: true })));
  }, [notifications]);

  // Derived state: Client-side searching (debounced SearchBar updates searchQuery prop)
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const searchLower = searchQuery.toLowerCase();
    
    logger.log('useNotifications', `Filtering list by search query: "${searchQuery}"`);
    
    return notifications.filter(
      (n) =>
        (n.Message && n.Message.toLowerCase().includes(searchLower)) ||
        (n.Type && n.Type.toLowerCase().includes(searchLower))
    );
  }, [notifications, searchQuery]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.Read).length;
  }, [notifications]);

  const stats = useMemo(() => {
    const result = { total: notifications.length, placement: 0, result: 0, event: 0 };
    notifications.forEach((n) => {
      const type = n.Type?.toLowerCase();
      if (type === 'placement') result.placement++;
      else if (type === 'result') result.result++;
      else if (type === 'event') result.event++;
    });
    return result;
  }, [notifications]);

  return {
    notifications: filteredNotifications,
    rawNotifications: notifications,
    loading,
    error,
    page,
    totalPages,
    limit,
    notificationType,
    searchQuery,
    unreadCount,
    stats,
    toast: newNotificationToast,
    clearToast: () => setNewNotificationToast(null),
    setPage,
    setLimit,
    setNotificationType,
    setSearchQuery,
    toggleReadStatus,
    markAllAsRead,
    retry: () => fetchNotifications(false),
  };
}

export default useNotifications;
