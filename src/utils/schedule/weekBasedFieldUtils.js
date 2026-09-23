/**
 * Utilities for parsing week-based field formats (location, note, etc.)
 *
 * Supports two formats:
 * 1. String format: same value for all weeks
 *    field: "Some value"
 *
 * 2. Object format: different values for different weeks
 *    field: {
 *      default: "Default value",  // optional
 *      weeks: {
 *        1: "Week 1 value",       // single week
 *        3: "Week 3 value",
 *        "5-8": "Weeks 5-8 value" // week range
 *      }
 *    }
 */

/**
 * Parse a week-based field value for a specific week
 * @param {Object|string} field - Field value (string or object format)
 * @param {number} week - Week number
 * @param {string} defaultValue - Default value if no match found
 * @returns {string} The value for the specified week
 */
export const parseWeekBasedField = (field, week, defaultValue = "") => {
  // String format: return as-is
  if (typeof field === "string") {
    return field;
  }

  // Object format with weeks mapping
  if (field && typeof field === "object" && field.weeks) {
    // Check each week entry for a match
    for (const [key, value] of Object.entries(field.weeks)) {
      // Single week: "1", "3"
      if (!key.includes("-")) {
        if (parseInt(key) === week) {
          return value;
        }
      } else {
        // Week range: "5-8"
        const [start, end] = key.split("-").map(Number);
        if (week >= start && week <= end) {
          return value;
        }
      }
    }

    // No match found, return default from object or fallback
    return field.default || defaultValue;
  }

  // Invalid format
  return defaultValue;
};
