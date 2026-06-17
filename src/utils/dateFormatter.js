/**
 * Formats a timestamp string (e.g. "2026-04-22 17:51:18") to a user-friendly format.
 * Includes fallback logic to avoid parsing issues across browsers.
 */
export function parseTimestamp(timestampStr) {
  if (!timestampStr) return new Date();
  // Replace space with 'T' to make it standard ISO if necessary, or parse manually
  const formatted = timestampStr.replace(' ', 'T');
  const date = new Date(formatted);
  if (isNaN(date.getTime())) {
    // Attempt manual parsing for "YYYY-MM-DD HH:mm:ss"
    const parts = timestampStr.split(' ');
    if (parts.length === 2) {
      const dateParts = parts[0].split('-');
      const timeParts = parts[1].split(':');
      if (dateParts.length === 3 && timeParts.length === 3) {
        return new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          parseInt(timeParts[0]),
          parseInt(timeParts[1]),
          parseInt(timeParts[2])
        );
      }
    }
    return new Date(timestampStr); // Final fallback
  }
  return date;
}

export function formatTimeAgo(timestampStr) {
  try {
    const date = parseTimestamp(timestampStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // If date is in the future (due to server/client time sync discrepancies)
    if (diffMs < 0) {
      return 'Just now';
    }

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (err) {
    return timestampStr;
  }
}

export function formatFullDateTime(timestampStr) {
  try {
    const date = parseTimestamp(timestampStr);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (err) {
    return timestampStr;
  }
}
