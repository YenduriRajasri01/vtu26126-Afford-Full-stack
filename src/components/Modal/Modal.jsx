import React, { useEffect } from 'react';
import { FiX, FiCalendar, FiTag, FiHash, FiAward, FiAlertCircle } from 'react-icons/fi';
import { getPriorityWeight, getPriorityLabel } from '../../utils/priorityCalculator';
import { formatFullDateTime } from '../../utils/dateFormatter';
import { logger } from '../../utils/logger';
import './Modal.css';

/**
 * Modal Component
 * Displays detailed information about a selected notification card.
 */
export function Modal({ isOpen = false, notification = null, onClose }) {
  // Log status on render changes
  useEffect(() => {
    if (isOpen && notification) {
      logger.log('ModalComponent', 'Details modal is rendering as active.', {
        id: notification.ID,
        type: notification.Type
      });
    }
  }, [isOpen, notification]);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        logger.log('ModalComponent', 'Escape key pressed. Requesting modal close.');
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  const { ID, Type, Message, Timestamp } = notification;
  const score = getPriorityWeight(Type);
  const label = getPriorityLabel(Type);
  const typeLower = Type ? Type.toLowerCase() : 'default';

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      logger.log('ModalComponent', 'Overlay clicked. Requesting modal close.');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-content animate-zoom">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <FiAlertCircle className={`modal-header-icon ${typeLower}`} />
            <h2>Notification Details</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close details modal">
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Message Banner */}
          <div className={`modal-message-banner ${typeLower}`}>
            <p className="modal-message-text">{Message}</p>
          </div>

          {/* Details Grid */}
          <div className="modal-details-grid">
            {/* ID */}
            <div className="detail-item">
              <div className="detail-label">
                <FiHash className="detail-icon" />
                <span>Reference ID</span>
              </div>
              <div className="detail-value mono">{ID}</div>
            </div>

            {/* Type */}
            <div className="detail-item">
              <div className="detail-label">
                <FiTag className="detail-icon" />
                <span>Notification Category</span>
              </div>
              <div className="detail-value">
                <span className={`badge-type ${typeLower}`}>{Type}</span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="detail-item">
              <div className="detail-label">
                <FiCalendar className="detail-icon" />
                <span>Dispatched Time</span>
              </div>
              <div className="detail-value">{formatFullDateTime(Timestamp)}</div>
            </div>

            {/* Priority */}
            <div className="detail-item">
              <div className="detail-label">
                <FiAward className="detail-icon" />
                <span>Priority Evaluation</span>
              </div>
              <div className="detail-value">
                <span className="priority-score-number">{score}</span>
                <span className="priority-score-label">({label} Priority Weight)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="modal-btn-close-action" onClick={onClose}>
            Dismiss Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
