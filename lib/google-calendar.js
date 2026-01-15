/**
 * Google Calendar API Integration for Band Bookings
 * Adapted from Handyman-Sam booking system
 */

const { google } = require('googleapis');

// Configuration - ADAPTED FOR BAND
const TIMEZONE = 'America/Los_Angeles'; // Change to your timezone
const BUFFER_MINUTES = 60; // Buffer between gigs (1 hour)

// Singleton calendar client
let calendarClient = null;

/**
 * Initialize Google Calendar API client
 */
async function getCalendarClient() {
  if (calendarClient) {
    return calendarClient;
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) {
    throw new Error(
      'Google Calendar credentials not configured. ' +
      'Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY'
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  calendarClient = google.calendar({ version: 'v3', auth });
  return calendarClient;
}

/**
 * Get calendar ID from environment
 */
function getCalendarId() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID environment variable not configured');
  }
  return calendarId;
}

/**
 * Generate time slots for 24-hour availability
 * CHANGE FROM HANDYMAN: No business hours restriction
 */
function generateTimeSlots() {
  const slots = [];

  // Generate hourly slots from midnight to 11 PM
  for (let hour = 0; hour < 24; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endHour = hour + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;

    slots.push({ start: startTime, end: endTime });
  }

  return slots;
}

/**
 * Get current time in Pacific timezone
 */
function getPacificTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type) => parts.find(p => p.type === type)?.value || '0';

  return {
    hour: parseInt(getPart('hour')),
    minute: parseInt(getPart('minute')),
    dateString: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
  };
}

/**
 * Check if a time slot is in the past
 */
function isSlotInPast(slotDate, slotTime) {
  const pacific = getPacificTime();
  const slotHour = parseInt(slotTime.split(':')[0]);
  const slotMinute = parseInt(slotTime.split(':')[1]);

  if (slotDate < pacific.dateString) return true;
  if (slotDate > pacific.dateString) return false;

  // Same day - compare times
  if (slotHour < pacific.hour) return true;
  if (slotHour === pacific.hour && slotMinute <= pacific.minute) return true;

  return false;
}

/**
 * Parse time to Date object
 */
function parseTimeToDate(date, time) {
  return new Date(`${date}T${time}:00`);
}

/**
 * Check if time ranges overlap
 */
function doTimesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

/**
 * Get available slots for a given date
 * CHANGE FROM HANDYMAN: Considers gig duration when checking availability
 */
async function getAvailableSlots(date, durationHours = 1) {
  try {
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];

    console.log(`[Calendar] Found ${events.length} events on ${date}`);

    // Build busy times with buffer
    const busyTimes = events.map((event) => {
      const startDateTime = event.start?.dateTime || '';
      const endDateTime = event.end?.dateTime || '';

      const startLocal = startDateTime.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
      const endLocal = endDateTime.replace(/([+-]\d{2}:\d{2}|Z)$/, '');

      const eventStart = new Date(startLocal || `${date}T00:00:00`);
      const eventEnd = new Date(endLocal || `${date}T23:59:59`);

      // Apply buffer before and after
      const bufferedStart = new Date(eventStart.getTime() - BUFFER_MINUTES * 60 * 1000);
      const bufferedEnd = new Date(eventEnd.getTime() + BUFFER_MINUTES * 60 * 1000);

      return { start: bufferedStart, end: bufferedEnd };
    });

    // Generate all possible slots
    const allSlots = generateTimeSlots();

    // Check each slot
    const availabilitySlots = allSlots.map((slot) => {
      const slotStart = parseTimeToDate(date, slot.start);
      // CHANGE: Consider the duration when checking if slot fits
      const slotEnd = new Date(slotStart.getTime() + durationHours * 60 * 60 * 1000);

      // Check if slot overlaps with any busy time
      const isBlocked = busyTimes.some((busy) =>
        doTimesOverlap(slotStart, slotEnd, busy.start, busy.end)
      );

      const isPast = isSlotInPast(date, slot.start);

      return {
        start: slot.start,
        end: slot.end,
        available: !isBlocked && !isPast,
      };
    });

    return availabilitySlots;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
}

/**
 * Create a booking event in Google Calendar
 * CHANGE FROM HANDYMAN: Adapted for band gig details
 */
async function createBookingEvent(booking) {
  try {
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();

    const startDateTime = `${booking.date}T${booking.time}:00`;

    // Calculate end time based on duration
    const startDate = new Date(`${booking.date}T${booking.time}:00`);
    const endDate = new Date(startDate.getTime() + booking.duration * 60 * 60 * 1000);
    const endDateTime = endDate.toISOString().split('T')[0] + 'T' +
                        endDate.toISOString().split('T')[1].substring(0, 5) + ':00';

    // Build event description for band gig
    const eventDescription = `
CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name: ${booking.contactName}
Phone: ${booking.contactPhone}
Email: ${booking.contactEmail}

EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━
Event Type: ${booking.eventType}
Duration: ${booking.duration} hours
Venue: ${booking.venueName}
Location: ${booking.venueAddress}
Expected Attendance: ${booking.expectedAttendance || 'Not specified'}

BUDGET & TECHNICAL
━━━━━━━━━━━━━━━━━━━━
Budget Range: ${booking.budgetRange || 'Not specified'}
Sound System at Venue: ${booking.soundSystem || 'Unknown'}
Stage Size: ${booking.stageSize || 'Not specified'}

EVENT DESCRIPTION
━━━━━━━━━━━━━━━━━━━━
${booking.eventDescription}

REFERRAL
━━━━━━━━━━━━━━━━━━━━
How they found us: ${booking.referralSource || 'Not specified'}

━━━━━━━━━━━━━━━━━━━━
Booked via Band Website
    `.trim();

    // Create the event
    const eventResponse = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `🎸 ${booking.eventType} - ${booking.contactName}`,
        description: eventDescription,
        location: booking.venueAddress,
        start: {
          dateTime: startDateTime,
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endDateTime,
          timeZone: TIMEZONE,
        },
        colorId: '9', // Blue color for gigs
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 * 7 }, // 1 week before
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 120 }, // 2 hours before
          ],
        },
      },
    });

    const event = eventResponse.data;

    return {
      id: event.id || `booking-${Date.now()}`,
      summary: event.summary || `Band Gig - ${booking.eventType}`,
      description: event.description || eventDescription,
      start: {
        dateTime: event.start?.dateTime || startDateTime,
        timeZone: event.start?.timeZone || TIMEZONE,
      },
      end: {
        dateTime: event.end?.dateTime || endDateTime,
        timeZone: event.end?.timeZone || TIMEZONE,
      },
      location: event.location || booking.venueAddress,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Check if a specific slot is available
 * CHANGE FROM HANDYMAN: Considers duration parameter
 */
async function isSlotAvailable(date, time, durationHours) {
  try {
    const calendar = await getCalendarClient();
    const calendarId = getCalendarId();

    if (isSlotInPast(date, time)) {
      console.log(`Slot ${time} on ${date} is in the past`);
      return false;
    }

    const slotStart = parseTimeToDate(date, time);
    const slotEnd = new Date(slotStart.getTime() + durationHours * 60 * 60 * 1000);

    // Expand query to include buffer
    const queryStart = new Date(slotStart.getTime() - BUFFER_MINUTES * 60 * 1000);
    const queryEnd = new Date(slotEnd.getTime() + BUFFER_MINUTES * 60 * 1000);

    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin: queryStart.toISOString(),
      timeMax: queryEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];

    console.log(`Checking slot ${time} on ${date} (${durationHours}hrs + ${BUFFER_MINUTES}min buffer):`);
    console.log(`  Found ${events.length} events in range`);

    return events.length === 0;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    throw error;
  }
}

module.exports = {
  getAvailableSlots,
  createBookingEvent,
  isSlotAvailable,
};
