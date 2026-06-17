import React from 'react';
import './Loader.css';

/**
 * SkeletonCard Component
 * Renders a placeholder structure with a moving shine (shimmer) effect.
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-header">
        <div className="skeleton-circle skeleton-shimmer" />
        <div className="skeleton-badge skeleton-shimmer" />
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-line-lg skeleton-shimmer" />
        <div className="skeleton-line skeleton-line-md skeleton-shimmer" />
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-line-sm skeleton-shimmer" />
        <div className="skeleton-dot skeleton-shimmer" />
      </div>
    </div>
  );
}

export default SkeletonCard;
