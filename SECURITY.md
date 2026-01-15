# Security Best Practices

This document outlines the security measures implemented in this project.

## API Key Protection

### ✅ What We Do

1. **No API Keys in Frontend Code**
   - All API keys are stored server-side in environment variables
   - Frontend code never contains hardcoded API keys
   - All sensitive API calls are proxied through backend endpoints

2. **Environment Variables**
   - `.env` files are in `.gitignore` to prevent accidental commits
   - API keys are loaded from `.env.build` in production
   - Different keys for development and production environments

3. **Backend Proxy Pattern**
   - Google Places API calls go through `/api/places-autocomplete` and `/api/places-details`
   - Google Calendar API calls go through `/api/availability` and `/api/book`
   - API keys never leave the server

### 🔒 Environment Variables Required

Create a `.env.build` file (already in `.gitignore`) with:

```env
# Google Calendar API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# Google Places API (server-side only)
GOOGLE_PLACES_API_KEY=your-places-api-key-here

# CORS Configuration
ALLOWED_ORIGIN=http://localhost:8080
```

### ⚠️ What NOT to Do

1. ❌ Never hardcode API keys in JavaScript files
2. ❌ Never commit `.env`, `.env.local`, or `.env.build` files
3. ❌ Never expose API keys in HTML script tags
4. ❌ Never log API keys in console or error messages

### 🛡️ Additional Security Measures

1. **CORS Protection**
   - Backend APIs check `ALLOWED_ORIGIN` environment variable
   - Only allow requests from your domain

2. **Rate Limiting**
   - Consider adding rate limiting to API endpoints in production
   - Use Vercel's built-in rate limiting features

3. **Input Validation**
   - All API endpoints validate input parameters
   - Return appropriate error messages without leaking system details

4. **HTTPS Only**
   - Use HTTPS in production
   - Vercel provides automatic HTTPS

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel dashboard
- [ ] `.env*` files in `.gitignore`
- [ ] No API keys in frontend code
- [ ] CORS configured with production domain
- [ ] HTTPS enabled
- [ ] API rate limiting configured

## Reporting Security Issues

If you discover a security vulnerability, please email [your-security-email@example.com] instead of opening a public issue.
