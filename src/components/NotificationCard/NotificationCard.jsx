import React from 'react';
import { FiBriefcase, FiAward, FiActivity, FiMail, FiCheck } from 'react-icons/fi';
import { getPriorityWeight, getPriorityLabel } from '../../utils/priorityCalculator';
import { formatTimeAgo } from '../../utils/dateFormatter';
import './NotificationCard.css';

/**
 * Helper to fetch corresponding icon based on type.
 */
function getIconForType(type) {
  switch (type?.toLowerCase()) {
    case 'placement':
      return <FiBriefcase className="card-type-icon" />;
    case 'result':
      return <FiAward className="card-type-icon" />;
    case 'event':
      return <FiActivity className="card-type-icon" />;
    default:
      return <FiMail className="card-type-icon" />;
  }
}

/**
 * NotificationCard Component
 * Displays a single notification's summarized information.
 */
export function NotificationCard({ notification = {}, onCardClick, onToggleRead }) {
  const { ID, Type, Message, Timestamp, Read } = notification;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(notification);
    }
  };

  const handleActionClick = (e) => {
    // Stop event bubbling so clicking the checkmark button does not open the details modal
    e.stopPropagation();
    if (onToggleRead) {
      onToggleRead(ID, !Read);
    }
  };

  const priorityScore = getPriorityWeight(Type);
  const priorityLabel = getPriorityLabel(Type);
  const typeLower = Type ? Type.toLowerCase() : 'default';

  return (
    <div
      className={`notification-card ${Read ? 'read' : 'unread'} type-${typeLower}`}
      onClick={handleCardClick}
      id={`card-${ID}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      {/* Indicator Bar */}
      <div className="card-indicator" />

      {/* Main Content Area */}
      <div className="card-main">
        {/* Left Side: Avatar Icon */}
        <div className="card-icon-container">
          {getIconForType(Type)}
          {!Read && <span className="unread-pulse-dot" />}
        </div>

        {/* Center: Message & Metadata */}
        <div className="card-body">
          <div className="card-header-meta">
            <span className={`badge-type ${typeLower}`}>{Type}</span>
            <span className="card-time" title={Timestamp}>
              {formatTimeAgo(Timestamp)}
            </span>
          </div>
          <p className="card-message">{Message}</p>
          <div className="card-sub-info">
            <span className="card-priority-score">
              Priority: <span className="score-num">{priorityScore}</span> ({priorityLabel})
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action Button */}
        <div className="card-actions">
          <button
            className={`card-btn-action ${Read ? 'btn-unread' : 'btn-read'}`}
            onClick={handleActionClick}
            title={Read ? 'Mark as Unread' : 'Mark as Read'}
            aria-label={Read ? 'Mark as Unread' : 'Mark as Read'}
          >
            {Read ? <FiMail /> : <FiCheck />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NotificationCard);
