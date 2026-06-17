import React from 'react';
import { FiFilter } from 'react-icons/fi';
import './Filters.css';

/**
 * Filters Component
 * Renders category select dropdown.
 */
export function Filters({ selectedType = '', onTypeChange }) {
  const options = [
    { value: '', label: 'All Categories' },
    { value: 'Placement', label: 'Placement Drives' },
    { value: 'Result', label: 'Academic Results' },
    { value: 'Event', label: 'Campus Events' }
  ];

  return (
    <div className="filters-wrapper">
      <FiFilter className="filters-icon" />
      <select
        className="filters-select"
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        aria-label="Filter notifications by category"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Filters;
