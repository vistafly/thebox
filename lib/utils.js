/**
 * Utility functions for band booking system
 */

/**
 * Format phone number as (XXX) XXX-XXXX
 */
function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 10);

  if (limited.length === 0) {
    return '';
  } else if (limited.length <= 3) {
    return `(${limited}`;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

/**
 * Format time from 24-hour to 12-hour with AM/PM
 */
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

/**
 * Format date to readable string
 */
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

module.exports = {
  formatPhoneNumber,
  formatTime,
  formatDate,
};
