import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

/**
 * Pagination Component
 * Handles paginated notification display and limits.
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  limit = 10,
  onPageChange,
  onLimitChange
}) {
  const limits = [10, 15, 20, 50];

  // Helper to generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">
      {/* Items per page selector */}
      <div className="pagination-limit">
        <label htmlFor="limit-select" className="limit-label">
          Show
        </label>
        <select
          id="limit-select"
          className="limit-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          {limits.map((l) => (
            <option key={l} value={l}>
              {l} items
            </option>
          ))}
        </select>
      </div>

      {/* Page Navigation */}
      <div className="pagination-nav">
        <button
          className="pagination-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <FiChevronLeft />
          <span className="btn-text">Previous</span>
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          aria-label="Next page"
        >
          <span className="btn-text">Next</span>
          <FiChevronRight />
        </button>
      </div>

      {/* Info indicator */}
      <div className="pagination-info">
        Page <span className="bold">{currentPage}</span> of <span className="bold">{totalPages || 1}</span>
      </div>
    </div>
  );
}

export default Pagination;
