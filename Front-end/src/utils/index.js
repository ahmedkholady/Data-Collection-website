/**
 * Shared frontend utilities
 */

/**
 * Clean phone numbers by removing spaces, dashes, and parentheses
 * @param {string} phone
 * @returns {string}
 */
export const sanitizePhoneString = (phone) => {
  if (!phone) return '';
  return String(phone).trim().replace(/[\s\-()]/g, '');
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes
 * @returns {string}
 */
export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
