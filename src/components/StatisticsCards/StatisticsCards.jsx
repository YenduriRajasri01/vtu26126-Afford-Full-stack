import React, { useState, useEffect } from 'react';
import { FiBell, FiBriefcase, FiAward, FiActivity } from 'react-icons/fi';
import './StatisticsCards.css';

/**
 * AnimatedCounter Helper Component
 * Animates numerical progress from 0 to the target value.
 */
function AnimatedCounter({ value, duration = 800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10) || 0;
    const start = count;
    
    if (end === start) return;

    const range = end - start;
    const steps = 30; // Number of steps in the animation
    const stepTime = Math.max(duration / steps, 16); // cap minimum interval (16ms = ~60fps)
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const nextCount = Math.round(start + range * easeProgress);

      if (currentStep >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(nextCount);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

/**
 * StatisticsCards Component
 * Renders the responsive 4-column statistics grid.
 */
export function StatisticsCards({ stats = {} }) {
  const { total = 0, placement = 0, result = 0, event = 0 } = stats;

  const cardItems = [
    {
      id: 'stat-total',
      label: 'Total Notifications',
      value: total,
      icon: <FiBell className="stat-icon" />,
      themeClass: 'theme-total'
    },
    {
      id: 'stat-placement',
      label: 'Placement Drives',
      value: placement,
      icon: <FiBriefcase className="stat-icon" />,
      themeClass: 'theme-placement'
    },
    {
      id: 'stat-result',
      label: 'Academic Results',
      value: result,
      icon: <FiAward className="stat-icon" />,
      themeClass: 'theme-result'
    },
    {
      id: 'stat-event',
      label: 'Campus Events',
      value: event,
      icon: <FiActivity className="stat-icon" />,
      themeClass: 'theme-event'
    }
  ];

  return (
    <div className="statistics-grid">
      {cardItems.map((card) => (
        <div key={card.id} className={`stat-card ${card.themeClass}`}>
          <div className="stat-card-header">
            <div className="stat-icon-wrapper">{card.icon}</div>
            <span className="stat-label">{card.label}</span>
          </div>
          <div className="stat-value" id={`${card.id}-val`}>
            <AnimatedCounter value={card.value} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatisticsCards;
