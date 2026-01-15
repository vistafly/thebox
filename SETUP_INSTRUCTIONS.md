# Band Booking System - Complete Setup Instructions

## What's Been Created So Far

✅ **Backend Files (Complete)**:
- `package.json` - Node.js dependencies (googleapis, date-fns installed)
- `lib/google-calendar.js` - Google Calendar integration
- `lib/utils.js` - Backend utilities
- `api/availability.js` - Availability API endpoint
- `api/book.js` - Booking creation endpoint
- `vercel.json` - Deployment configuration
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

✅ **Frontend JavaScript (Partially Complete)**:
- `booking/js/constants.js` - Configuration constants
- `booking/js/utils.js` - Frontend utilities
- `booking/js/api-client.js` - API communication
- `booking/js/form-validator.js` - Form validation

⏳ **Still Need to Create**:
- `booking/js/calendar-renderer.js` - Calendar UI
- `booking/js/google-places.js` - Google Places autocomplete
- `booking/js/booking.js` - Main application orchestrator
- `booking/index.html` - Frontend structure
- `booking/css/booking.css` - Styles (matching website theme)

---

## Step 1: Complete Remaining JavaScript Files

### A. Create `booking/js/calendar-renderer.js`

Copy the following code into `booking/js/calendar-renderer.js`:

```javascript
/**
 * Calendar rendering logic
 */

import {
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  dateToString,
  formatMonthYear,
} from './utils.js';

export class CalendarRenderer {
  constructor(containerEl, options = {}) {
    this.containerEl = containerEl;
    this.today = startOfDay(new Date());
    this.maxDate = addMonths(this.today, options.advanceMonths || 12);
    this.currentMonth = this.findFirstAvailableMonth();
    this.selectedDate = null;
    this.onDateSelect = options.onDateSelect || (() => {});
  }

  findFirstAvailableMonth() {
    let month = startOfMonth(this.today);
    const maxMonth = startOfMonth(this.maxDate);

    while (month <= maxMonth) {
      const days = this.generateCalendarDays(month);
      const hasAvailableDay = days.some(day => day.isAvailable);

      if (hasAvailableDay) {
        return month;
      }

      month = addMonths(month, 1);
    }

    return startOfMonth(this.today);
  }

  generateCalendarDays(month) {
    const days = [];
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDayOfWeek = monthStart.getDay();

    // Previous month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = addDays(monthStart, -(startDayOfWeek - i));
      const isPast = isBefore(date, this.today);
      const isTooFar = isAfter(date, this.maxDate);

      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: !isPast && !isTooFar,
        isPast,
        isToday: isSameDay(date, this.today),
      });
    }

    // Current month days
    let currentDate = monthStart;
    while (currentDate <= monthEnd) {
      const isPast = isBefore(currentDate, this.today);
      const isTooFar = isAfter(currentDate, this.maxDate);

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: true,
        isAvailable: !isPast && !isTooFar,
        isPast,
        isToday: isSameDay(currentDate, this.today),
      });

      currentDate = addDays(currentDate, 1);
    }

    // Next month padding
    const endDayOfWeek = monthEnd.getDay();
    for (let i = endDayOfWeek + 1; i < 7; i++) {
      const date = addDays(monthEnd, i - endDayOfWeek);
      const isPast = isBefore(date, this.today);
      const isTooFar = isAfter(date, this.maxDate);

      days.push({
        date,
        isCurrentMonth: false,
        isAvailable: !isPast && !isTooFar,
        isPast,
        isToday: isSameDay(date, this.today),
      });
    }

    return days;
  }

  render() {
    const days = this.generateCalendarDays(this.currentMonth);
    const html = days
      .map(day => {
        const classes = ['calendar-day'];

        if (day.isAvailable) classes.push('available');
        if (day.isPast || !day.isAvailable) classes.push('unavailable');
        if (!day.isCurrentMonth) classes.push('other-month');
        if (day.isToday) classes.push('today');
        if (this.selectedDate && isSameDay(day.date, this.selectedDate)) {
          classes.push('selected');
        }

        const dateStr = dateToString(day.date);

        return `
          <div
            class="${classes.join(' ')}"
            data-date="${dateStr}"
            ${day.isAvailable ? '' : 'disabled'}
          >
            ${day.date.getDate()}
          </div>
        `;
      })
      .join('');

    this.containerEl.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.containerEl.querySelectorAll('.calendar-day.available').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        const dateStr = dayEl.dataset.date;
        const [year, month, day] = dateStr.split('-').map(Number);
        this.selectedDate = new Date(year, month - 1, day);
        this.render(); // Re-render to show selection
        this.onDateSelect(this.selectedDate);
      });
    });
  }

  nextMonth() {
    const next = addMonths(this.currentMonth, 1);
    if (!isAfter(next, startOfMonth(this.maxDate))) {
      this.currentMonth = next;
      this.render();
      return true;
    }
    return false;
  }

  prevMonth() {
    const prev = addMonths(this.currentMonth, -1);
    if (!isBefore(prev, startOfMonth(this.today))) {
      this.currentMonth = prev;
      this.render();
      return true;
    }
    return false;
  }

  goToMonth(month) {
    this.currentMonth = month;
    this.render();
  }

  getCurrentMonth() {
    return this.currentMonth;
  }

  getAvailableMonths() {
    const months = [];
    let month = startOfMonth(this.today);
    const maxMonth = startOfMonth(this.maxDate);

    while (month <= maxMonth) {
      months.push(new Date(month));
      month = addMonths(month, 1);
    }

    return months;
  }

  getSelectedDate() {
    return this.selectedDate;
  }
}
```

### B. Create `booking/js/google-places.js`

### C. Create `booking/js/booking.js` (Main Application)

### D. Create `booking/index.html`

### E. Create `booking/css/booking.css`

---

## Step 2: Google Cloud Setup

Before the booking system can work, you need to configure Google Cloud:

### 2.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Create Project"
3. Name: "thebox-booking-system"
4. Click "Create"

### 2.2 Enable APIs
1. Navigate to "APIs & Services" → "Library"
2. Search for and enable:
   - **Google Calendar API**
   - **Places API**
3. Confirm billing is enabled (required for Places API)

### 2.3 Create Service Account
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "Service account"
3. Name: `thebox-booking-service`
4. Role: **Editor**
5. Click "Create and Continue"
6. Click "Done"
7. Click on the service account you just created
8. Go to "Keys" tab → "Add Key" → "Create new key"
9. Choose "JSON"
10. Download the JSON file
11. **IMPORTANT**: Save this file securely!

### 2.4 Create Booking Calendar
1. Go to https://calendar.google.com/
2. Click "+" next to "Other calendars"
3. Choose "Create new calendar"
4. Name: "The Box - Band Bookings"
5. Description: "Gig booking calendar for availability management"
6. Click "Create calendar"
7. Click on the new calendar → Settings → "Integrate calendar"
8. Copy the **Calendar ID** (looks like: abc123@group.calendar.google.com)

### 2.5 Share Calendar with Service Account
1. In calendar Settings → "Share with specific people"
2. Click "Add people"
3. Paste the service account email from the JSON file (the `client_email` field)
4. Permission: **"Make changes to events"** (NOT just "See all event details")
5. Click "Send"

### 2.6 Create Places API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "API key"
3. Copy the API key immediately
4. Click "EDIT API KEY" to restrict it:
   - **API restrictions**: "Restrict key" → Select "Places API"
   - **Website restrictions**:
     - Add `http://localhost:*`
     - Add `http://127.0.0.1:*`
     - (Will add production URL after deployment)
5. Save

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env.local` (for local development)

Create a file called `.env.local` in the project root with:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
ALLOWED_ORIGIN=http://localhost:8080
```

**How to fill these values:**
1. Open the service account JSON file you downloaded
2. Copy the `client_email` value → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
3. Copy the `private_key` value → `GOOGLE_PRIVATE_KEY` (keep the `\n` characters!)
4. Use the Calendar ID from step 2.4 → `GOOGLE_CALENDAR_ID`

### 3.2 Update Frontend Constants

Edit `booking/js/constants.js`:

```javascript
// Replace YOUR_PLACES_API_KEY with your actual Places API key
export const PLACES_API_KEY = 'AIza...your-actual-key-here';
```

---

## Step 4: Test Locally

### 4.1 Start Backend (Vercel Dev Server)

Open terminal in project root:

```bash
npx vercel dev
```

This will start the backend at `http://localhost:3000`

### 4.2 Start Frontend (HTTP Server)

Open a NEW terminal:

```bash
cd booking
python -m http.server 8080
```

OR

```bash
npx http-server booking -p 8080
```

### 4.3 Test in Browser

1. Open `http://localhost:8080` in your browser
2. Test calendar navigation
3. Select a date and duration
4. Check that time slots load
5. Fill out the booking form
6. Submit a test booking
7. Verify the event appears in Google Calendar

---

## Step 5: Deployment

### 5.1 Deploy Backend to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Set environment variables in Vercel:**

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
# Paste the service account email

vercel env add GOOGLE_PRIVATE_KEY production
# Paste the entire private key with \n characters

vercel env add GOOGLE_CALENDAR_ID production
# Paste the calendar ID

vercel env add ALLOWED_ORIGIN production
# Enter your GitHub Pages URL (e.g., https://yourusername.github.io)
```

**Note your Vercel deployment URL** (e.g., `https://thebox-booking.vercel.app`)

### 5.2 Update Frontend Configuration

Edit `booking/js/constants.js`:

```javascript
export const API_BASE_URL = 'https://thebox-booking.vercel.app'; // Your Vercel URL
```

### 5.3 Deploy Frontend to GitHub Pages

```bash
cd "c:\Git Uploads\thebox"

# Initialize git (if not already done)
git init
git add .
git commit -m "Add band booking system"
git branch -M main
git remote add origin https://github.com/yourusername/thebox.git
git push -u origin main
```

**Enable GitHub Pages:**
1. Go to your repository on GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: `main`, Folder: `/` (root)
5. Save

### 5.4 Update CORS and API Key Restrictions

1. **Update Vercel ALLOWED_ORIGIN:**
   ```bash
   vercel env rm ALLOWED_ORIGIN production
   vercel env add ALLOWED_ORIGIN production
   # Enter: https://yourusername.github.io
   vercel --prod
   ```

2. **Update Places API Key restrictions:**
   - Google Cloud Console → Credentials
   - Edit your Places API key
   - Add `https://yourusername.github.io/*` to HTTP referrers
   - Save

---

## Step 6: Integration with Main Website

Update `index.html` (line ~676) to link to the booking system:

```html
<div class="booking-form">
    <a href="booking/index.html" class="cta-button" style="display: inline-block; text-decoration: none; padding: 15px 40px;">
        <span class="cta-text">Check Availability & Book</span>
    </a>
    <p style="margin-top: 20px; color: var(--text-secondary);">
        Real-time booking system with instant calendar confirmation
    </p>
</div>
```

---

## Complete File Reference

For the complete code of the remaining files, see:
- `BAND_BOOKING_SETUP_GUIDE.md` (lines 986-1904 for HTML and CSS)
- `BAND_BOOKING_SETUP_GUIDE_PART2.md` (lines 451-1034 for remaining JavaScript)

---

## Troubleshooting

### "Google Calendar credentials not configured"
- Check that `.env.local` exists with all three Google variables
- Verify `GOOGLE_PRIVATE_KEY` includes `\n` characters
- Restart `npx vercel dev`

### "CORS error" in browser
- Verify `ALLOWED_ORIGIN` matches frontend URL exactly
- No trailing slash in the URL
- Redeploy backend after changing environment variables

### Time slots all show unavailable
- Check Google Calendar for conflicting events
- Verify service account has "Make changes to events" permission
- Check timezone setting in `lib/google-calendar.js`

### Google Places autocomplete doesn't work
- Verify API key in `booking/index.html` and `constants.js`
- Check Places API is enabled in Google Cloud
- Verify billing is enabled
- Check browser console for errors

---

## Next Steps After Setup

1. Test thoroughly with different dates and durations
2. Monitor Google Calendar for bookings
3. Consider adding email confirmations (SendGrid/Resend)
4. Add admin dashboard for booking management
5. Integrate payment processing (Stripe) for deposits

---

## Support Resources

- **Source Guides**: `BAND_BOOKING_README.md`, `BAND_BOOKING_SETUP_GUIDE.md`, `BAND_BOOKING_SETUP_GUIDE_PART2.md`
- **Google Calendar API**: https://developers.google.com/calendar/api/v3/reference
- **Google Places API**: https://developers.google.com/maps/documentation/places/web-service
- **Vercel Docs**: https://vercel.com/docs
