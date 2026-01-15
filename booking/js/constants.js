/**
 * Configuration constants for band booking
 */

// API Configuration - UPDATE THESE AFTER DEPLOYMENT
export const API_BASE_URL = 'http://localhost:3001'; // Update to Vercel URL after deployment

// Google Places API Key (exposed in frontend, restricted by domain)
export const PLACES_API_KEY = 'AIzaSyAFfAO2wxU8NcFmhJL63Kmw8mVQVdOgBRA';

// Event Types
export const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', defaultDuration: 4 },
  { id: 'corporate', label: 'Corporate Event', defaultDuration: 3 },
  { id: 'private', label: 'Private Party', defaultDuration: 4 },
  { id: 'festival', label: 'Festival', defaultDuration: 2 },
  { id: 'bar-club', label: 'Bar/Club', defaultDuration: 3 },
  { id: 'restaurant', label: 'Restaurant', defaultDuration: 2 },
  { id: 'birthday', label: 'Birthday Party', defaultDuration: 3 },
  { id: 'anniversary', label: 'Anniversary', defaultDuration: 4 },
  { id: 'other', label: 'Other', defaultDuration: 3 },
];

// Duration Packages (in hours)
export const DURATION_PACKAGES = [
  { hours: 2, label: '2 Hours', description: 'Perfect for cocktail hours' },
  { hours: 3, label: '3 Hours', description: 'Standard set length' },
  { hours: 4, label: '4 Hours', description: 'Full event coverage' },
  { hours: 6, label: '6 Hours', description: 'Extended performance' },
  { hours: 8, label: 'Full Day (8 Hours)', description: 'All-day events' },
];

// Referral Sources
export const REFERRAL_SOURCES = [
  'Google Search',
  'Instagram',
  'Facebook',
  'Friend/Family Referral',
  'Venue Recommendation',
  'Saw you perform',
  'Other',
];

// Availability Configuration
export const AVAILABILITY_CONFIG = {
  advanceBookingMonths: 12,
  timezone: 'America/Los_Angeles',
};
