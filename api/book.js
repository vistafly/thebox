/**
 * POST /api/book
 * Creates a booking in Google Calendar
 */

const { createBookingEvent, isSlotAvailable } = require('../lib/google-calendar');

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Validate booking form data
 */
function validateBooking(data) {
  const errors = {};

  if (!data.contactName || data.contactName.length < 2) {
    errors.contactName = 'Contact name is required';
  }

  // Phone and Email - at least one required
  const hasPhone = data.contactPhone && data.contactPhone.trim();
  const hasEmail = data.contactEmail && data.contactEmail.trim();

  if (!hasPhone && !hasEmail) {
    errors.contactPhone = 'Please provide phone or email';
  } else {
    // Validate phone format if provided
    if (hasPhone && !/^\d{10}$/.test(data.contactPhone.replace(/\D/g, ''))) {
      errors.contactPhone = 'Valid 10-digit phone number required';
    }

    // Validate email format if provided
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      errors.contactEmail = 'Valid email address required';
    }
  }

  if (!data.eventType) {
    errors.eventType = 'Event type is required';
  }

  if (!data.duration || data.duration < 1 || data.duration > 12) {
    errors.duration = 'Duration must be between 1 and 12 hours';
  }

  if (!data.venueName || data.venueName.length < 2) {
    errors.venueName = 'Venue name is required';
  }

  if (!data.venueAddress || data.venueAddress.length < 10) {
    errors.venueAddress = 'Valid venue address is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  }

  if (!data.time) {
    errors.time = 'Time is required';
  }

  if (!data.eventDescription || data.eventDescription.length < 20) {
    errors.eventDescription = 'Please provide at least 20 characters describing the event';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Validate
    const validation = validateBooking(data);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if slot is still available
    const slotAvailable = await isSlotAvailable(
      data.date,
      data.time,
      data.duration
    );

    if (!slotAvailable) {
      return res.status(409).json({
        error: 'This time slot is no longer available. Please select another time.',
      });
    }

    // Create calendar event
    const calendarEvent = await createBookingEvent({
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      eventType: data.eventType,
      duration: data.duration,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      expectedAttendance: data.expectedAttendance,
      budgetRange: data.budgetRange,
      soundSystem: data.soundSystem,
      stageSize: data.stageSize,
      eventDescription: data.eventDescription,
      referralSource: data.referralSource,
      date: data.date,
      time: data.time,
    });

    return res.status(200).json({
      success: true,
      bookingId: calendarEvent.id,
      message: 'Gig booking confirmed!',
      appointment: {
        date: data.date,
        time: data.time,
        duration: data.duration,
        eventType: data.eventType,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      error: 'Failed to create booking. Please try again.',
    });
  }
};
