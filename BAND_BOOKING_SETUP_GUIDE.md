# Band Booking System - Complete Setup Guide

> **A comprehensive guide to adapt the Handyman-Sam booking system for band gig bookings on vanilla HTML/CSS/JS websites**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [Prerequisites](#3-prerequisites)
4. [Backend Setup](#4-backend-setup)
5. [Frontend Setup](#5-frontend-setup)
6. [Google Places Integration](#6-google-places-integration)
7. [Customization Guide](#7-customization-guide)
8. [Deployment](#8-deployment)
9. [Testing](#9-testing)
10. [Troubleshooting](#10-troubleshooting)
11. [Appendix](#11-appendix)

---

## 1. Introduction

### 1.1 What This Guide Does

This guide helps you implement a full-featured band booking system by adapting the Handyman-Sam codebase. You'll create:

- **Real-time availability checking** via Google Calendar API
- **Two-step booking flow**: Date/Time selection → Event details form
- **Google Places autocomplete** for venue addresses
- **Duration-based booking** (2hr, 3hr, 4hr, 6hr, 8hr packages)
- **Automatic calendar blocking** with buffers between gigs
- **Serverless backend** (Vercel/Netlify) + **static frontend** (GitHub Pages)

### 1.2 What Gets Adapted

| Handyman Feature | Band Feature |
|------------------|--------------|
| Service types (Plumbing, Electrical, etc.) | Event types (Wedding, Corporate, Festival, etc.) |
| Business hours (8 AM - 6 PM) | 24/7 availability |
| Fixed duration appointments | Selectable duration packages (2-8 hours) |
| Simple address fields | Google Places autocomplete |
| React/Next.js frontend | Vanilla HTML/CSS/JavaScript |
| Single deployment | Split: GitHub Pages + Serverless backend |

### 1.3 Final File Structure

```
your-band-website/
├── booking/                    # Frontend (GitHub Pages)
│   ├── index.html
│   ├── css/
│   │   └── booking.css
│   └── js/
│       ├── booking.js
│       ├── api-client.js
│       ├── calendar-renderer.js
│       ├── form-validator.js
│       ├── google-places.js
│       ├── constants.js
│       └── utils.js
│
├── api/                        # Backend (Vercel/Netlify)
│   ├── availability.js
│   └── book.js
│
├── lib/                        # Shared library code
│   ├── google-calendar.js
│   └── utils.js
│
├── package.json
├── .env.local                  # Environment variables (DO NOT COMMIT)
├── .env.example                # Template for environment variables
├── .gitignore
└── vercel.json (or netlify.toml)
```

---

## 2. Architecture Overview

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Vanilla JS Booking App (GitHub Pages)                    │  │
│  │  - Calendar UI                                            │  │
│  │  - Form validation                                        │  │
│  │  - Google Places Autocomplete                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                    ▲
         │ HTTPS + CORS                       │
         ▼                                    │
┌─────────────────────────────────────────────────────────────────┐
│              Serverless Functions (Vercel/Netlify)              │
│  ┌─────────────────────┐      ┌─────────────────────────────┐  │
│  │  /api/availability  │      │     /api/book               │  │
│  │  - Get free slots   │      │  - Validate slot            │  │
│  │  - Check calendar   │      │  - Create calendar event    │  │
│  └─────────────────────┘      └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         │ Google Calendar API                │
         ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Google Calendar                            │
│  - Band's booking calendar                                      │
│  - Real-time availability                                       │
│  - Event management                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Viewing Available Slots:**
1. User selects date on calendar
2. Frontend calls `/api/availability?date=2026-01-15`
3. Backend queries Google Calendar API
4. Returns available time slots (accounting for buffers)
5. Frontend displays available times

**Making a Booking:**
1. User fills form and submits
2. Frontend validates form data
3. Frontend calls `/api/book` with booking details
4. Backend double-checks slot availability
5. Backend creates Google Calendar event
6. Returns confirmation to frontend
7. Frontend shows success message

---

## 3. Prerequisites

### 3.1 Required Accounts & Tools

- [ ] **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- [ ] **Git** - [Download](https://git-scm.com/)
- [ ] **Google Cloud Account** - [Sign up](https://console.cloud.google.com/)
- [ ] **Vercel Account** OR **Netlify Account** - [Vercel](https://vercel.com/) | [Netlify](https://www.netlify.com/)
- [ ] **GitHub Account** (for GitHub Pages) - [Sign up](https://github.com/)
- [ ] **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

### 3.2 Google Cloud Setup

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "NEW PROJECT"
3. Name it: `band-booking-system`
4. Click "CREATE"

#### Step 2: Enable APIs

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API" → Click it → Click "ENABLE"
3. Search for "Places API" → Click it → Click "ENABLE"

#### Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "Service account"
3. Name: `band-booking-service`
4. Click "CREATE AND CONTINUE"
5. Role: Select "Editor" (or "Owner")
6. Click "CONTINUE" → "DONE"

#### Step 4: Download Service Account Key

1. Click on the service account you just created
2. Go to "KEYS" tab
3. Click "ADD KEY" → "Create new key"
4. Choose "JSON" format
5. Click "CREATE" - a JSON file will download
6. **KEEP THIS FILE SECURE** - it contains your private key

#### Step 5: Create Google Calendar

1. Go to [Google Calendar](https://calendar.google.com/)
2. Click "+" next to "Other calendars"
3. Select "Create new calendar"
4. Name: `Band Bookings`
5. Description: `Gig booking calendar`
6. Click "Create calendar"

#### Step 6: Share Calendar with Service Account

1. Find your new calendar in the left sidebar
2. Click the three dots next to it → "Settings and sharing"
3. Scroll to "Share with specific people"
4. Click "Add people"
5. Enter the service account email (found in the JSON file: `client_email`)
   - Example: `band-booking-service@band-booking-system.iam.gserviceaccount.com`
6. Permission: "Make changes to events"
7. Click "Send"

#### Step 7: Get Calendar ID

1. Still in calendar settings, scroll to "Integrate calendar"
2. Copy the "Calendar ID"
   - Example: `abc123xyz@group.calendar.google.com`
3. Save this for later

#### Step 8: Create Google Places API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "API key"
3. Copy the API key that appears
4. Click "EDIT API KEY"
5. Under "API restrictions":
   - Select "Restrict key"
   - Check "Places API"
6. Under "Website restrictions":
   - Select "HTTP referrers"
   - Add your GitHub Pages URL: `https://yourbandname.github.io/*`
   - Add `http://localhost:*` for local testing
7. Click "SAVE"

### 3.3 Extract Environment Variables from JSON

Open the downloaded JSON file from Step 4. You'll need these values:

```json
{
  "type": "service_account",
  "project_id": "band-booking-system",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "band-booking-service@band-booking-system.iam.gserviceaccount.com",
  ...
}
```

Extract:
- `client_email` → **GOOGLE_SERVICE_ACCOUNT_EMAIL**
- `private_key` → **GOOGLE_PRIVATE_KEY** (keep the `\n` characters!)

---

## 4. Backend Setup

### 4.1 Project Initialization

Create your project folder and initialize:

```bash
mkdir band-booking
cd band-booking
npm init -y
```

### 4.2 Install Dependencies

```bash
npm install googleapis date-fns
```

### 4.3 Environment Variables

Create `.env.local`:

```bash
# Google Calendar API
GOOGLE_SERVICE_ACCOUNT_EMAIL=band-booking-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# Google Places API (for frontend, but stored here for reference)
GOOGLE_PLACES_API_KEY=AIza...your-api-key

# CORS - Your GitHub Pages URL
ALLOWED_ORIGIN=https://yourbandname.github.io
```

Create `.env.example` (for version control):

```bash
# Google Calendar API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GOOGLE_CALENDAR_ID=your-calendar@group.calendar.google.com

# Google Places API
GOOGLE_PLACES_API_KEY=your-places-api-key

# CORS
ALLOWED_ORIGIN=https://your-site.github.io
```

Create `.gitignore`:

```
node_modules/
.env.local
.env
.vercel
.netlify
dist/
```

### 4.4 Create Library Files

#### `lib/google-calendar.js`

This is adapted from the Handyman-Sam TypeScript code to vanilla JavaScript:

```javascript
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
```

#### `lib/utils.js`

Utility functions adapted from Handyman-Sam:

```javascript
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
```

### 4.5 Create API Routes

#### For Vercel: `api/availability.js`

```javascript
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
    return res.status(200).setHeader(CORS_HEADERS).end();
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
```

#### For Vercel: `api/book.js`

```javascript
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

  if (!data.contactPhone || !/^\d{10}$/.test(data.contactPhone.replace(/\D/g, ''))) {
    errors.contactPhone = 'Valid 10-digit phone number required';
  }

  if (!data.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.contactEmail = 'Valid email address required';
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
    return res.status(200).setHeader(CORS_HEADERS).end();
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
```

### 4.6 Deployment Configuration

#### For Vercel: `vercel.json`

```json
{
  "version": 2,
  "env": {
    "GOOGLE_SERVICE_ACCOUNT_EMAIL": "@google-service-account-email",
    "GOOGLE_PRIVATE_KEY": "@google-private-key",
    "GOOGLE_CALENDAR_ID": "@google-calendar-id",
    "ALLOWED_ORIGIN": "@allowed-origin"
  },
  "build": {
    "env": {
      "GOOGLE_SERVICE_ACCOUNT_EMAIL": "@google-service-account-email",
      "GOOGLE_PRIVATE_KEY": "@google-private-key",
      "GOOGLE_CALENDAR_ID": "@google-calendar-id",
      "ALLOWED_ORIGIN": "@allowed-origin"
    }
  }
}
```

#### For Netlify: `netlify.toml`

```toml
[build]
  functions = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## 5. Frontend Setup

### 5.1 HTML Structure

Create `booking/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book the Band</title>

  <!-- Google Places API -->
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_PLACES_API_KEY&libraries=places" async defer></script>

  <!-- Styles -->
  <link rel="stylesheet" href="css/booking.css">
</head>
<body>
  <div class="booking-container">
    <!-- Header -->
    <header class="booking-header">
      <h1>Book Us for Your Event</h1>
      <p>Select your preferred date, time, and tell us about your event</p>
    </header>

    <!-- Progress Steps -->
    <div class="progress-steps" id="progressSteps">
      <div class="step active" data-step="1">
        <span class="step-number">1</span>
        <span class="step-label">Date & Time</span>
      </div>
      <div class="step-divider"></div>
      <div class="step" data-step="2">
        <span class="step-number">2</span>
        <span class="step-label">Event Details</span>
      </div>
    </div>

    <!-- Booking Form -->
    <form id="bookingForm" class="booking-form">
      <!-- Step 1: Date/Time Selection -->
      <div class="form-step active" id="step1">
        <div class="step-content">
          <!-- Month Navigation -->
          <div class="calendar-header">
            <button type="button" class="month-nav-btn" id="prevMonth" disabled>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div class="month-selector">
              <button type="button" id="currentMonthBtn" class="current-month-btn">
                <span id="currentMonthLabel">Loading...</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="month-dropdown hidden" id="monthDropdown"></div>
            </div>

            <button type="button" class="month-nav-btn" id="nextMonth">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <div class="weekday">Sun</div>
              <div class="weekday">Mon</div>
              <div class="weekday">Tue</div>
              <div class="weekday">Wed</div>
              <div class="weekday">Thu</div>
              <div class="weekday">Fri</div>
              <div class="weekday">Sat</div>
            </div>
            <div class="calendar-days" id="calendarDays">
              <!-- Generated by JavaScript -->
            </div>
          </div>

          <!-- Duration Selection -->
          <div class="duration-section hidden" id="durationSection">
            <label class="section-label">Select Duration</label>
            <div class="duration-grid" id="durationGrid">
              <button type="button" class="duration-btn" data-duration="2">2 Hours</button>
              <button type="button" class="duration-btn" data-duration="3">3 Hours</button>
              <button type="button" class="duration-btn" data-duration="4">4 Hours</button>
              <button type="button" class="duration-btn" data-duration="6">6 Hours</button>
              <button type="button" class="duration-btn" data-duration="8">Full Day (8hrs)</button>
            </div>
          </div>

          <!-- Time Slot Selection -->
          <div class="timeslot-section hidden" id="timeslotSection">
            <label class="section-label">Select Time</label>
            <div class="timeslot-loading hidden" id="timeslotLoading">
              <div class="spinner"></div>
              <p>Loading available times...</p>
            </div>
            <div class="timeslot-grid" id="timeslotGrid">
              <!-- Generated by JavaScript -->
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-primary" id="continueToDetails" disabled>
              Continue to Event Details
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Event Details -->
      <div class="form-step" id="step2">
        <div class="step-content">
          <div class="form-grid">
            <!-- Event Type -->
            <div class="form-group full-width">
              <label for="eventType">Event Type *</label>
              <select id="eventType" name="eventType" class="form-input" required>
                <option value="">Select event type</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Private Party">Private Party</option>
                <option value="Festival">Festival</option>
                <option value="Bar/Club">Bar/Club</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Other">Other</option>
              </select>
              <span class="error-message"></span>
            </div>

            <!-- Contact Name -->
            <div class="form-group">
              <label for="contactName">Contact Name *</label>
              <input type="text" id="contactName" name="contactName" class="form-input" placeholder="John Doe" required>
              <span class="error-message"></span>
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label for="contactPhone">Phone Number *</label>
              <input type="tel" id="contactPhone" name="contactPhone" class="form-input" placeholder="(555) 123-4567" required>
              <span class="error-message"></span>
            </div>

            <!-- Email -->
            <div class="form-group full-width">
              <label for="contactEmail">Email Address *</label>
              <input type="email" id="contactEmail" name="contactEmail" class="form-input" placeholder="john@example.com" required>
              <span class="error-message"></span>
            </div>

            <!-- Venue Name -->
            <div class="form-group full-width">
              <label for="venueName">Venue Name *</label>
              <input type="text" id="venueName" name="venueName" class="form-input" placeholder="Grand Ballroom" required>
              <span class="error-message"></span>
            </div>

            <!-- Venue Address (Google Places) -->
            <div class="form-group full-width">
              <label for="venueAddress">Venue Address *</label>
              <input type="text" id="venueAddress" name="venueAddress" class="form-input" placeholder="123 Main St, City, State ZIP" required>
              <span class="error-message"></span>
            </div>

            <!-- Expected Attendance -->
            <div class="form-group">
              <label for="expectedAttendance">Expected Attendance</label>
              <input type="number" id="expectedAttendance" name="expectedAttendance" class="form-input" placeholder="100" min="1">
            </div>

            <!-- Budget Range -->
            <div class="form-group">
              <label for="budgetRange">Budget Range</label>
              <select id="budgetRange" name="budgetRange" class="form-input">
                <option value="">Select budget range</option>
                <option value="Under $1,000">Under $1,000</option>
                <option value="$1,000 - $2,500">$1,000 - $2,500</option>
                <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                <option value="$5,000+">$5,000+</option>
                <option value="Prefer to discuss">Prefer to discuss</option>
              </select>
            </div>

            <!-- Sound System -->
            <div class="form-group">
              <label for="soundSystem">Sound System at Venue?</label>
              <select id="soundSystem" name="soundSystem" class="form-input">
                <option value="Unknown">Unknown</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <!-- Stage Size -->
            <div class="form-group">
              <label for="stageSize">Stage Size (if known)</label>
              <input type="text" id="stageSize" name="stageSize" class="form-input" placeholder="e.g., 20ft x 15ft">
            </div>

            <!-- Event Description -->
            <div class="form-group full-width">
              <label for="eventDescription">Event Description *</label>
              <textarea id="eventDescription" name="eventDescription" class="form-input" rows="4" placeholder="Tell us about your event, music preferences, atmosphere, special requests, etc. (minimum 20 characters)" required></textarea>
              <span class="error-message"></span>
            </div>

            <!-- Referral Source -->
            <div class="form-group full-width">
              <label for="referralSource">How did you hear about us?</label>
              <select id="referralSource" name="referralSource" class="form-input">
                <option value="">Select source</option>
                <option value="Google Search">Google Search</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Friend/Family Referral">Friend/Family Referral</option>
                <option value="Venue Recommendation">Venue Recommendation</option>
                <option value="Saw you perform">Saw you perform</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="backToDateTime">
              Back to Date & Time
            </button>
            <button type="submit" class="btn btn-primary" id="submitBooking">
              <span class="btn-text">Submit Booking Request</span>
              <span class="btn-loading hidden">
                <div class="spinner-small"></div>
                Submitting...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div class="success-state hidden" id="successState">
        <div class="success-content">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#10B981"/>
              <path d="M20 32L28 40L44 24" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Booking Request Submitted!</h2>
          <p class="success-message">
            We've received your booking request for <strong id="successEventType"></strong> on
            <strong id="successDate"></strong> at <strong id="successTime"></strong>.
          </p>
          <p class="success-note">
            We'll review your request and get back to you within 24 hours to confirm availability and discuss details.
          </p>
          <div class="success-actions">
            <button type="button" class="btn btn-primary" id="newBooking">
              Book Another Event
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>

  <!-- Scripts -->
  <script type="module" src="js/booking.js"></script>
</body>
</html>
```

### 5.2 CSS Styling

Create `booking/css/booking.css`:

```css
/* Band Booking System Styles */
/* Adapted from Handyman-Sam with custom branding */

:root {
  /* Brand Colors - Customize these! */
  --primary-color: #DC2626; /* Red - change to your brand color */
  --primary-hover: #B91C1C;
  --secondary-color: #1A1A1A;
  --accent-color: #FCD34D;

  /* UI Colors */
  --background: #FFFFFF;
  --surface: #F9FAFB;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-disabled: #9CA3AF;

  /* Status Colors */
  --success: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--surface);
}

/* Container */
.booking-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

/* Header */
.booking-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.booking-header h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.booking-header p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* Progress Steps */
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  gap: var(--spacing-md);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0.5;
  transition: opacity 0.3s;
}

.step.active {
  opacity: 1;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  background: var(--border);
  color: var(--text-secondary);
  font-weight: 600;
  transition: all 0.3s;
}

.step.active .step-number {
  background: var(--primary-color);
  color: white;
}

.step-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.step.active .step-label {
  color: var(--text-primary);
}

.step-divider {
  width: 3rem;
  height: 2px;
  background: var(--border);
}

/* Form Steps */
.form-step {
  display: none;
}

.form-step.active {
  display: block;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Calendar */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.month-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.month-nav-btn:hover:not(:disabled) {
  background: var(--surface);
}

.month-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.month-selector {
  position: relative;
}

.current-month-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  background: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.current-month-btn:hover {
  border-color: var(--primary-color);
}

.month-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
}

.month-dropdown.hidden {
  display: none;
}

.month-option {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background 0.2s;
}

.month-option:hover {
  background: var(--surface);
}

.month-option.active {
  background: var(--primary-color);
  color: white;
}

/* Calendar Grid */
.calendar-grid {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.weekday {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: var(--spacing-sm);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.calendar-day.available {
  background: var(--surface);
  color: var(--text-primary);
}

.calendar-day.available:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.calendar-day.selected {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-hover);
}

.calendar-day.today.available {
  border-color: var(--accent-color);
}

.calendar-day.unavailable {
  color: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.4;
}

.calendar-day.other-month {
  opacity: 0.3;
}

/* Duration Selection */
.duration-section {
  margin-bottom: var(--spacing-lg);
}

.duration-section.hidden {
  display: none;
}

.section-label {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.duration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.duration-btn {
  padding: var(--spacing-md);
  border: 2px solid var(--border);
  background: white;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.duration-btn:hover {
  border-color: var(--primary-color);
  background: var(--surface);
}

.duration-btn.selected {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

/* Time Slots */
.timeslot-section {
  margin-bottom: var(--spacing-xl);
}

.timeslot-section.hidden {
  display: none;
}

.timeslot-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
}

.timeslot-loading.hidden {
  display: none;
}

.timeslot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.timeslot-btn {
  padding: var(--spacing-md);
  border: 2px solid var(--border);
  background: white;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.timeslot-btn.available:hover {
  border-color: var(--primary-color);
  background: var(--surface);
}

.timeslot-btn.selected {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.timeslot-btn.unavailable {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input.error {
  border-color: var(--error);
}

.error-message {
  font-size: 0.875rem;
  color: var(--error);
  min-height: 1.25rem;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--surface);
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-loading.hidden {
  display: none;
}

/* Success State */
.success-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.success-state.hidden {
  display: none;
}

.success-content {
  max-width: 500px;
  margin: 0 auto;
}

.success-icon {
  margin-bottom: var(--spacing-xl);
}

.success-content h2 {
  font-size: 2rem;
  color: var(--success);
  margin-bottom: var(--spacing-md);
}

.success-message {
  font-size: 1.125rem;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.success-note {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.success-actions {
  display: flex;
  justify-content: center;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary-color);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .booking-container {
    padding: var(--spacing-md);
  }

  .booking-header h1 {
    font-size: 1.75rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: 1;
  }

  .progress-steps {
    gap: var(--spacing-sm);
  }

  .step-label {
    display: none;
  }

  .step-divider {
    width: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

/* Utility Classes */
.hidden {
  display: none !important;
}
```

### 5.3 JavaScript Files

Due to length constraints, I'll provide the core JavaScript structure. The complete implementation follows the same patterns as the backend.

Create `booking/js/constants.js`:

```javascript
/**
 * Configuration constants for band booking
 */

// API Configuration - UPDATE THESE AFTER DEPLOYMENT
export const API_BASE_URL = 'https://your-backend.vercel.app'; // or Netlify URL

// Google Places API Key (exposed in frontend, restricted by domain)
export const PLACES_API_KEY = 'YOUR_PLACES_API_KEY';

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
```

I'll create a separate document with the remaining JavaScript files and complete deployment instructions due to length. Would you like me to:

1. Continue with the complete JavaScript implementation in this document?
2. Create a second supplementary document with the remaining code?
3. Provide the instructions in a more condensed format?

What would work best for you?