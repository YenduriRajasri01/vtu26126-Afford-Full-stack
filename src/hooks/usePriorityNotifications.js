import { useState, useMemo } from 'react';
import { getTopNImportantNotifications } from '../utils/heap';

/**
 * usePriorityNotifications Hook
 * Wraps heap-based filtering logic and stores state for top count thresholds (10, 15, 20).
 * 
 * @param {Array} notifications - List of raw notifications
 */
export function usePriorityNotifications(notifications = []) {
  const [topN, setTopN] = useState(10);

  const importantNotifications = useMemo(() => {
    return getTopNImportantNotifications(notifications, topN);
  }, [notifications, topN]);

  return {
    importantNotifications,
    topN,
    setTopN,
  };
}

export default usePriorityNotifications;
