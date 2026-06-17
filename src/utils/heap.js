import { getPriorityWeight } from './priorityCalculator';
import { logger } from './logger';

/**
 * Compare function to determine priority.
 * Returns true if notification `a` has LESS priority than `b`.
 * Priority comparison:
 * 1. Priority Weight (Placement = 3, Result = 2, Event = 1)
 * 2. Timestamp (Latest timestamp is higher priority)
 */
export function compareNotifications(a, b) {
  const weightA = getPriorityWeight(a.Type);
  const weightB = getPriorityWeight(b.Type);

  if (weightA !== weightB) {
    return weightA < weightB; // Lower weight = lower priority
  }

  // If weights are equal, older timestamp = lower priority
  const timeA = new Date(a.Timestamp).getTime();
  const timeB = new Date(b.Timestamp).getTime();
  return timeA < timeB;
}

/**
 * Standard Min Heap implementation.
 */
export class MinHeap {
  constructor(compareFn) {
    this.heap = [];
    this.compare = compareFn || compareNotifications; // Default comparator
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.size() === 0) return null;
    const root = this.heap[0];
    const last = this.heap.pop();
    if (this.size() > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return root;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex])) {
        this._swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;
    while (2 * index + 1 < length) {
      let leftChild = 2 * index + 1;
      let rightChild = leftChild + 1;
      let smallest = leftChild;

      if (rightChild < length && this.compare(this.heap[rightChild], this.heap[leftChild])) {
        smallest = rightChild;
      }

      if (this.compare(this.heap[smallest], this.heap[index])) {
        this._swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

/**
 * Extracts the top N highest priority unread notifications from a list.
 */
export function getTopNImportantNotifications(notifications, n) {
  const unreadNotifications = notifications.filter(notif => !notif.Read);
  
  logger.log('MinHeap', `Processing Top-${n} Important extraction`, {
    totalUnread: unreadNotifications.length
  });

  if (unreadNotifications.length === 0) {
    return [];
  }

  const heap = new MinHeap(compareNotifications);

  for (const notif of unreadNotifications) {
    if (heap.size() < n) {
      heap.push(notif);
    } else {
      if (compareNotifications(heap.peek(), notif)) {
        heap.pop();
        heap.push(notif);
      }
    }
  }

  const result = [];
  while (heap.size() > 0) {
    result.push(heap.pop());
  }

  // Reverse to get descending priority order (highest priority first)
  const sortedResult = result.reverse();
  
  logger.log('MinHeap', `Successfully extracted Top-${n} items`, {
    resultCount: sortedResult.length
  });
  
  return sortedResult;
}
