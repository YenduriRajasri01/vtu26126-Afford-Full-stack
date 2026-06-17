import React, { useState, useMemo } from 'react';
import { getTopNImportantNotifications } from '../../utils/heap';
import { getPriorityWeight } from '../../utils/priorityCalculator';
import { formatTimeAgo } from '../../utils/dateFormatter';
import { FiTrendingUp, FiCheck } from 'react-icons/fi';
import './PriorityNotifications.css';

/**
 * PriorityNotifications Component
 * Displays a priority sidebar section containing the Top N highest priority unread notifications.
 */
export function PriorityNotifications({ notifications = [], onCardClick, onToggleRead }) {
  const [topLimit, setTopLimit] = useState(10);

  // Derive the Top N unread notifications using the custom Min Heap
  const importantNotifications = useMemo(() => {
    return getTopNImportantNotifications(notifications, topLimit);
  }, [notifications, topLimit]);

  const handleLimitChange = (e) => {
    setTopLimit(Number(e.target.value));
  };

  return (
    <aside className="priority-panel" aria-label="Important notifications panel">
      <div className="priority-panel-header">
        <div className="priority-title">
          <FiTrendingUp className="priority-trend-icon" />
          <h3>Important</h3>
        </div>
        <div className="priority-select-wrapper">
          <select
            className="priority-limit-select"
            value={topLimit}
            onChange={handleLimitChange}
            aria-label="Important notifications count limit"
          >
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      </div>

      <div className="priority-list">
        {importantNotifications.length === 0 ? (
          <div className="priority-empty-state">
            <p className="priority-empty-msg">No important unread notifications.</p>
          </div>
        ) : (
          importantNotifications.map((notif) => {
            const weight = getPriorityWeight(notif.Type);
            const typeLower = notif.Type ? notif.Type.toLowerCase() : 'default';
            
            return (
              <div
                key={`priority-${notif.ID}`}
                className={`priority-item type-${typeLower}`}
                onClick={() => onCardClick && onCardClick(notif)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onCardClick && onCardClick(notif);
                  }
                }}
              >
                <div className="priority-item-badge-bar" />
                <div className="priority-item-content">
                  <div className="priority-item-header">
                    <span className={`priority-badge ${typeLower}`}>{notif.Type}</span>
                    <span className="priority-time">{formatTimeAgo(notif.Timestamp)}</span>
                  </div>
                  <p className="priority-message">{notif.Message}</p>
                  <div className="priority-footer">
                    <span className="priority-score-badge">Weight: {weight}</span>
                    <button
                      className="priority-btn-done"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRead && onToggleRead(notif.ID, true);
                      }}
                      title="Mark as Read"
                      aria-label="Mark as Read"
                    >
                      <FiCheck />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

export default PriorityNotifications;
