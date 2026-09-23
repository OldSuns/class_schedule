/**
 * Date and time utility functions for schedule management
 */

/**
 * Check if a value is a valid finite timestamp
 */
export const isFiniteTimestamp = (value) => Number.isFinite(value) && value > 0;

/**
 * Check if enough time has elapsed since a timestamp
 */
export const hasElapsed = (lastAt, intervalMs, now = Date.now()) =>
  !isFiniteTimestamp(lastAt) || now - lastAt >= intervalMs;

/**
 * Get today's date as a YYYY-MM-DD string
 */
export const getTodayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Check if a remote schedule check status indicates success
 */
export const isRemoteCheckSuccessful = (status) =>
  status && status !== "error" && status !== "busy";
