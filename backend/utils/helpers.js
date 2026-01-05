/**
 * Utility functions for the backend
 */

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Clean up temporary files
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<void>}
 */
async function cleanupFile(filePath) {
  const fs = require('fs-extra');
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
}

module.exports = {
  isValidEmail,
  cleanupFile,
};

