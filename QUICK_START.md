# Quick Start Guide - Band Booking System

## Current Status

✅ Backend code is complete and ready
✅ Dependencies installed
✅ Vercel CLI installed
⚠️ Need Google Cloud credentials to run

## Step 1: Google Cloud Setup (Required Before Running)

You **MUST** complete this before the booking system will work:

### 1.1 Create Google Cloud Project (5 minutes)

1. Go to https://console.cloud.google.com/
2. Click "Select a project" (top bar) → "New Project"
3. Project name: `thebox-booking`
4. Click "Create"
5. Wait for project creation, then select it

### 1.2 Enable Required APIs (2 minutes)

1. In your new project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API" → Click it → Click "Enable"
3. Search for "Places API" → Click it → Click "Enable"
4. Click "Enable Billing" if prompted (free tier is generous, won't be charged for testing)

### 1.3 Create Service Account (3 minutes)

1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "Service account"
3. Service account details:
   - Name: `thebox-booking-service`
   - Service account ID: (auto-filled)
   - Click "Create and Continue"
4. Grant role:
   - Select role: "Editor" (from dropdown)
   - Click "Continue"
5. Click "Done"
6. You'll see your service account listed. Click on it
7. Go to "Keys" tab
8. Click "Add Key" → "Create new key"
9. Choose "JSON"
10. Click "Create" → **JSON file downloads automatically**
11. **SAVE THIS FILE SECURELY!** You'll need it in the next step

### 1.4 Create Booking Calendar (2 minutes)

1. Go to https://calendar.google.com/
2. Next to "Other calendars" on the left, click the "+" button
3. Choose "Create new calendar"
4. Calendar details:
   - Name: `The Box - Band Bookings`
   - Description: `Gig booking calendar for availability management`
   - Time zone: `America/Los Angeles` (or your timezone)
5. Click "Create calendar"
6. Find your new calendar in the left sidebar
7. Click the three dots next to it → "Settings and sharing"
8. Scroll to "Integrate calendar" section
9. **Copy the Calendar ID** (looks like: `abc123def@group.calendar.google.com`)
10. **SAVE THIS** - you'll need it next

### 1.5 Share Calendar with Service Account (1 minute)

1. Still in calendar settings, scroll to "Share with specific people"
2. Click "Add people"
3. Open the JSON file you downloaded in step 1.3
4. Find the `"client_email"` field (looks like: `thebox-booking-service@....iam.gserviceaccount.com`)
5. Copy that email and paste it in the "Add people" field
6. Set permissions to: **"Make changes to events"** (important!)
7. Uncheck "Send email notification"
8. Click "Send"

### 1.6 Create Places API Key (2 minutes)

1. Go back to Google Cloud Console → "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "API key"
3. **Copy the API key immediately and save it**
4. Click "Edit API key" (or the pencil icon)
5. Under "API restrictions":
   - Select "Restrict key"
   - Check only "Places API"
6. Under "Website restrictions":
   - Select "HTTP referrers (web sites)"
   - Click "Add an item"
   - Add: `http://localhost:*`
   - Click "Add an item"
   - Add: `http://127.0.0.1:*`
7. Click "Save"

---

## Step 2: Configure Environment Variables (2 minutes)

### 2.1 Update `.env.local`

Open the file `c:\Git Uploads\thebox\.env.local` and replace the placeholder values:

1. **GOOGLE_SERVICE_ACCOUNT_EMAIL**:
   - Open the JSON file from step 1.3
   - Find `"client_email": "..."`
   - Copy the entire email address
   - Paste it in `.env.local`

2. **GOOGLE_PRIVATE_KEY**:
   - In the JSON file, find `"private_key": "-----BEGIN PRIVATE KEY-----\n..."`
   - Copy the ENTIRE value (including the quotes)
   - Paste it in `.env.local`
   - **CRITICAL**: Keep all the `\n` characters - they're important!

3. **GOOGLE_CALENDAR_ID**:
   - Use the Calendar ID from step 1.4
   - Paste it in `.env.local`

4. **ALLOWED_ORIGIN**:
   - Leave as `http://localhost:8080` for local development

**Example of correctly filled `.env.local`:**

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=thebox-booking-service@thebox-booking-123456.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...(very long key)...=\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=abc123def456@group.calendar.google.com
ALLOWED_ORIGIN=http://localhost:8080
```

### 2.2 Update Frontend Constants

Open `booking/js/constants.js` and update line 9:

```javascript
export const PLACES_API_KEY = 'YOUR_ACTUAL_API_KEY_FROM_STEP_1.6';
```

---

## Step 3: Start Development Servers (1 minute)

### Terminal 1 - Backend Server:

```bash
cd "c:\Git Uploads\thebox"
npm run dev
```

You should see:
```
Vercel CLI [version]
> Ready! Available at http://localhost:3000
```

### Terminal 2 - Frontend Server:

Open a NEW terminal:

```bash
cd "c:\Git Uploads\thebox\booking"
python -m http.server 8080
```

OR if you don't have Python:

```bash
npx http-server . -p 8080
```

You should see:
```
Serving HTTP on :: port 8080 ...
```

---

## Step 4: Test the Booking System

1. Open your browser to: **http://localhost:8080**
2. You should see the booking calendar
3. Try selecting a date in the future
4. Choose a duration (e.g., 4 hours)
5. Click on an available time slot
6. Fill out the booking form
7. Submit
8. Check your Google Calendar - you should see the booking appear!

---

## Troubleshooting

### "Google Calendar credentials not configured"

**Problem**: `.env.local` is not correctly configured

**Solution**:
1. Check that `.env.local` exists in project root
2. Verify all 4 environment variables are filled
3. Make sure `GOOGLE_PRIVATE_KEY` has `\n` characters (not actual newlines)
4. Restart the dev server (`Ctrl+C`, then `npm run dev` again)

### "CORS error" in browser console

**Problem**: Backend and frontend URLs don't match

**Solution**:
1. Make sure backend is running on `http://localhost:3000`
2. Make sure frontend is running on `http://localhost:8080`
3. Check `ALLOWED_ORIGIN` in `.env.local` is `http://localhost:8080`

### Calendar shows but no time slots appear

**Problem**: API call is failing

**Solution**:
1. Open browser DevTools (F12) → Console tab
2. Look for error messages
3. Check that `API_BASE_URL` in `booking/js/constants.js` is `http://localhost:3000`
4. Verify backend server is running (check Terminal 1)

### "Cannot GET /api/availability"

**Problem**: Backend isn't running or wrong URL

**Solution**:
1. Make sure you ran `npm run dev` in Terminal 1
2. Check that Vercel dev server shows "Ready"
3. Test directly: visit `http://localhost:3000/api/availability?date=2026-02-15&duration=4` in browser

---

## What's Next?

Once local testing works:

1. **Complete the remaining frontend files** (HTML, CSS, remaining JS)
   - See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for file locations

2. **Deploy to production**
   - Backend: Vercel
   - Frontend: GitHub Pages
   - Instructions in [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

3. **Integrate with main website**
   - Add booking link to `index.html`
   - Replace Fillout iframe

---

## Support

If you get stuck:
1. Check the error message in browser console (F12)
2. Check Vercel dev server output in Terminal 1
3. Review [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
4. Check the source guides: `BAND_BOOKING_SETUP_GUIDE.md` and `BAND_BOOKING_SETUP_GUIDE_PART2.md`
