# Band Booking System - Complete Setup Instructions

This folder contains comprehensive instructions to adapt the Handyman-Sam booking system for a band website using vanilla HTML/CSS/JavaScript with a serverless backend.

## 📚 Documentation Files

### **BAND_BOOKING_SETUP_GUIDE.md** (Main Guide - Part 1)
Contains:
- ✅ Introduction & Architecture Overview
- ✅ Prerequisites & Google Cloud Setup
- ✅ Complete Backend Implementation (Node.js serverless functions)
- ✅ Frontend HTML & CSS (with full code)
- ✅ Configuration constants

### **BAND_BOOKING_SETUP_GUIDE_PART2.md** (Part 2)
Contains:
- ✅ Complete Frontend JavaScript Implementation (all 6 JS modules)
- ✅ Google Places Integration Guide
- ✅ Customization Instructions
- ✅ Deployment Steps (Vercel/Netlify + GitHub Pages)
- ✅ Testing Checklist
- ✅ Troubleshooting Guide

## 🚀 Quick Start

1. **Read BAND_BOOKING_SETUP_GUIDE.md first** - Get context and set up prerequisites
2. **Follow Section 3** - Set up Google Cloud (Calendar API + Places API)
3. **Build Backend (Section 4)** - Create all backend files
4. **Build Frontend (Section 5 + Part 2)** - Create all frontend files
5. **Deploy (Part 2, Section 8)** - Deploy backend to Vercel/Netlify, frontend to GitHub Pages
6. **Test (Part 2, Section 9)** - Run through testing checklist
7. **Customize (Part 2, Section 7)** - Brand colors, event types, form fields

## 📋 What You're Building

A complete band booking system with:

| Feature | Description |
|---------|-------------|
| **Real-time Availability** | Google Calendar integration shows available slots |
| **Duration-Based Booking** | 2hr, 3hr, 4hr, 6hr, 8hr packages |
| **Smart Scheduling** | 60-minute buffer between gigs, 12-month advance booking |
| **Google Places** | Autocomplete for venue addresses |
| **Two-Step Flow** | Date/Time selection → Event details form |
| **Mobile Responsive** | Works on all devices |
| **24/7 Availability** | No business hours restriction (unlike handyman version) |
| **Serverless** | Cost-effective, auto-scaling backend |

## 🗂️ Final File Structure

```
your-band-website/
├── booking/                    # Frontend (GitHub Pages)
│   ├── index.html
│   ├── css/
│   │   └── booking.css
│   └── js/
│       ├── booking.js           (Main app logic)
│       ├── api-client.js        (Backend API calls)
│       ├── calendar-renderer.js (Calendar UI)
│       ├── form-validator.js    (Form validation)
│       ├── google-places.js     (Address autocomplete)
│       ├── constants.js         (Configuration)
│       └── utils.js             (Helper functions)
│
├── api/                        # Backend (Vercel/Netlify)
│   ├── availability.js         (GET available slots)
│   └── book.js                 (POST create booking)
│
├── lib/                        # Shared library
│   ├── google-calendar.js      (Google Calendar integration)
│   └── utils.js                (Utilities)
│
├── package.json
├── .env.local                  (Environment variables - DON'T COMMIT)
├── .env.example                (Template)
├── .gitignore
└── vercel.json (or netlify.toml)
```

## 🎯 Key Differences from Handyman-Sam

| Aspect | Handyman-Sam | Band Booking |
|--------|--------------|--------------|
| **Tech Stack** | Next.js 15 + React 19 | Vanilla HTML/CSS/JS |
| **Hosting** | Single Vercel deployment | GitHub Pages + Serverless Backend |
| **Services** | 18 handyman services | Event types (Wedding, Corporate, etc.) |
| **Duration** | Fixed 1-hour appointments | Variable (2-8 hour packages) |
| **Hours** | 8 AM - 6 PM, closed Sundays | 24/7 availability |
| **Form** | Service + Address fields | Event Type + Venue (Google Places) + Technical Requirements |
| **Booking Window** | 6 months | 12 months |

## ⚙️ Environment Variables Required

### Backend (Vercel/Netlify)
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar@group.calendar.google.com
ALLOWED_ORIGIN=https://yourbandname.github.io
```

### Frontend (constants.js)
```javascript
API_BASE_URL='https://your-backend.vercel.app'
PLACES_API_KEY='AIza...your-key'
```

## 💰 Cost Estimate

**Total: ~$0/month** (within free tiers)

- Google Calendar API: Free (1M requests/day)
- Google Places API: First $200/month free (requires billing enabled)
- Vercel/Netlify: Free tier (100GB bandwidth)
- GitHub Pages: Free (1GB storage, 100GB bandwidth)

## 📞 Support

If you encounter issues:

1. ✅ Check **Part 2, Section 10** (Troubleshooting) first
2. ✅ Review browser console for JavaScript errors
3. ✅ Check backend logs (Vercel/Netlify dashboard)
4. ✅ Verify all environment variables are set correctly
5. ✅ Test API endpoints directly with `curl`
6. ✅ Confirm Google Cloud APIs are enabled and billing is active

## 📖 How to Use These Instructions

### For You (Original User)
You can now:
1. Copy these two markdown files to give to the developer working on the band website
2. Or follow them yourself to implement the booking system

### For Developers Receiving These Instructions
1. Start with **BAND_BOOKING_SETUP_GUIDE.md**
2. Read through Section 1-3 to understand the system
3. Follow Section 3 to set up Google Cloud
4. Build backend (Section 4)
5. Move to **BAND_BOOKING_SETUP_GUIDE_PART2.md** for complete frontend code
6. Deploy following Section 8 in Part 2
7. Test using Section 9 checklist
8. Customize using Section 7

## ✨ Features You Can Customize

All documented in **Part 2, Section 7**:

- 🎨 Brand colors (CSS variables)
- 📅 Event types (Wedding, Corporate, Festival, etc.)
- ⏱️ Duration packages (2hr, 3hr, 4hr, etc.)
- 🕐 Buffer time between gigs (default 60 minutes)
- 🌍 Timezone
- 📋 Form fields (add/remove as needed)
- 📆 Advance booking window (default 12 months)

## 🎸 What Happens When a User Books?

1. User selects date on calendar
2. User selects duration package (e.g., 4 hours)
3. System fetches available time slots from Google Calendar
4. User selects time slot
5. User fills event details form (venue, contact info, etc.)
6. Google Places autocompletes venue address
7. User submits form
8. System validates slot is still available
9. System creates Google Calendar event with all details
10. User sees success confirmation
11. Band sees booking in their Google Calendar (with email/popup reminders)

## 🛠️ Technologies Used

**Frontend:**
- HTML5
- CSS3 (custom CSS, no frameworks)
- Vanilla JavaScript (ES6+ modules)
- Google Places API

**Backend:**
- Node.js
- Google Calendar API (googleapis npm package)
- Serverless Functions (Vercel/Netlify)

**Hosting:**
- GitHub Pages (frontend static files)
- Vercel or Netlify (serverless backend)

## 📊 Total Documentation Size

- **BAND_BOOKING_SETUP_GUIDE.md**: ~950 lines (Sections 1-5)
- **BAND_BOOKING_SETUP_GUIDE_PART2.md**: ~1,300 lines (Complete JS + Deployment + Testing)
- **Total**: ~2,250 lines of comprehensive documentation + complete working code

---

## 🎉 You're All Set!

These instructions contain **everything** needed to implement a production-ready band booking system. Every file is included with complete, working code that can be copied directly.

Good luck with your band's bookings! 🎸🎶

---

**Created:** 2026-01-12
**Adapted From:** Handyman-Sam Booking System
**License:** Use freely for your band website
