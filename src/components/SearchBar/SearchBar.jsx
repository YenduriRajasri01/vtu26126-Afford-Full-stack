import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

/**
 * SearchBar Component
 * Renders a debounced search field to filter notifications.
 */
export function SearchBar({ value = '', onChange, placeholder = 'Search notifications...' }) {
  const [localValue, setLocalValue] = useState(value);

  // Sync internal state with external prop if it changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="search-bar-wrapper">
      <FiSearch className="search-bar-icon" />
      <input
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        value={localValue}
        onChange={handleInputChange}
        aria-label={placeholder}
      />
      {localValue && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={handleClear}
          title="Clear search"
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
