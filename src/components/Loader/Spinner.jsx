import React from 'react';
import './Loader.css';

/**
 * Spinner Component
 * Displays a premium loading spinner with customizable sizes and messages.
 */
export function Spinner({ size = 'medium', message = 'Loading...' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className={`spinner spinner-${size}`} />
      {message && <p className="spinner-text">{message}</p>}
    </div>
  );
}

export default Spinner;
