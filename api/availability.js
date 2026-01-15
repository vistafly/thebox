/**
 * GET /api/availability?date=YYYY-MM-DD&duration=4
 * Returns available time slots for a given date and duration
 */

const { getAvailableSlots } = require('../lib/google-calendar');

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).end();
  }

  // Add CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, duration } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Parse duration (default to 4 hours for gigs)
    const durationHours = duration ? parseInt(duration, 10) : 4;

    // Check if date is in the past
    const selectedDate = new Date(`${date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ error: 'Cannot book gigs in the past' });
    }

    // Get available slots
    const slots = await getAvailableSlots(date, durationHours);

    return res.status(200).json({
      date,
      duration: durationHours,
      slots,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
};
