/**
 * Calculates priority weight for notification types:
 * - Placement = 3 (High)
 * - Result = 2 (Medium)
 * - Event = 1 (Low)
 */
export function getPriorityWeight(type) {
  if (!type) return 0;
  const normalized = type.toLowerCase();
  switch (normalized) {
    case 'placement':
      return 3;
    case 'result':
      return 2;
    case 'event':
      return 1;
    default:
      return 0;
  }
}

/**
 * Returns a human-friendly name or style class name for the priority level.
 */
export function getPriorityLabel(type) {
  const weight = getPriorityWeight(type);
  switch (weight) {
    case 3:
      return 'High';
    case 2:
      return 'Medium';
    case 1:
      return 'Low';
    default:
      return 'None';
  }
}
