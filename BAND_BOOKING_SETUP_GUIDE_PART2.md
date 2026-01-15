# Band Booking System - Setup Guide Part 2

> **Continuation of BAND_BOOKING_SETUP_GUIDE.md - JavaScript Implementation, Google Places, Customization, Deployment & Troubleshooting**

---

## Complete Frontend JavaScript Implementation

### `booking/js/utils.js`

```javascript
/**
 * Utility functions for frontend
 */

export function formatPhoneNumber(value) {
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

export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatMonthYear(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isBefore(date1, date2) {
  return date1 < date2;
}

export function isAfter(date1, date2) {
  return date1 > date2;
}

export function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function dateToString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### `booking/js/api-client.js`

```javascript
/**
 * API Client for backend communication
 */

import { API_BASE_URL } from './constants.js';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async getAvailability(date, duration) {
    return this.request(`/api/availability?date=${date}&duration=${duration}`);
  }

  async createBooking(bookingData) {
    return this.request('/api/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);
```

### `booking/js/form-validator.js`

```javascript
/**
 * Form validation for band booking
 */

export class FormValidator {
  constructor() {
    this.errors = {};
  }

  validate(formData) {
    this.errors = {};

    // Contact Name
    if (!formData.contactName || formData.contactName.length < 2) {
      this.errors.contactName = 'Contact name is required (minimum 2 characters)';
    }

    // Phone
    const phoneDigits = formData.contactPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      this.errors.contactPhone = 'Please enter a valid 10-digit phone number';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contactEmail || !emailRegex.test(formData.contactEmail)) {
      this.errors.contactEmail = 'Please enter a valid email address';
    }

    // Event Type
    if (!formData.eventType) {
      this.errors.eventType = 'Please select an event type';
    }

    // Venue Name
    if (!formData.venueName || formData.venueName.length < 2) {
      this.errors.venueName = 'Venue name is required';
    }

    // Venue Address
    if (!formData.venueAddress || formData.venueAddress.length < 10) {
      this.errors.venueAddress = 'Please enter a complete venue address';
    }

    // Event Description
    if (!formData.eventDescription || formData.eventDescription.length < 20) {
      this.errors.eventDescription = 'Please provide at least 20 characters describing your event';
    }

    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: this.errors,
    };
  }

  displayErrors(errors) {
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

    // Display new errors
    Object.entries(errors).forEach(([field, message]) => {
      const input = document.getElementById(field);
      const errorSpan = input?.parentElement.querySelector('.error-message');

      if (input) {
        input.classList.add('error');
      }

      if (errorSpan) {
        errorSpan.textContent = message;
      }
    });

    // Scroll to first error
    const firstErrorInput = document.querySelector('.form-input.error');
    if (firstErrorInput) {
      firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorInput.focus();
    }
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
  }
}

export const formValidator = new FormValidator();
```

### `booking/js/calendar-renderer.js`

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

### `booking/js/google-places.js`

```javascript
/**
 * Google Places Autocomplete integration
 */

import { PLACES_API_KEY } from './constants.js';

export class GooglePlacesAutocomplete {
  constructor(inputElement) {
    this.inputElement = inputElement;
    this.autocomplete = null;
    this.selectedPlace = null;
  }

  async initialize() {
    // Wait for Google Maps API to load
    await this.waitForGoogleMaps();

    // Initialize autocomplete
    this.autocomplete = new google.maps.places.Autocomplete(this.inputElement, {
      types: ['establishment', 'geocode'],
      fields: ['formatted_address', 'name', 'geometry', 'place_id', 'address_components'],
    });

    // Listen for place selection
    this.autocomplete.addListener('place_changed', () => {
      this.selectedPlace = this.autocomplete.getPlace();
      this.onPlaceSelected(this.selectedPlace);
    });
  }

  waitForGoogleMaps() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve();
        return;
      }

      // Wait up to 10 seconds
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(interval);
          resolve();
        }

        attempts++;
        if (attempts > 100) {
          clearInterval(interval);
          reject(new Error('Google Maps API failed to load'));
        }
      }, 100);
    });
  }

  onPlaceSelected(place) {
    if (!place.formatted_address) {
      console.warn('No address details available for selected place');
      return;
    }

    // Auto-fill address field
    this.inputElement.value = place.formatted_address;

    // Store additional details
    this.selectedPlace = {
      address: place.formatted_address,
      name: place.name,
      placeId: place.place_id,
      lat: place.geometry?.location?.lat(),
      lng: place.geometry?.location?.lng(),
    };

    console.log('Selected place:', this.selectedPlace);
  }

  getSelectedPlace() {
    return this.selectedPlace;
  }
}
```

### `booking/js/booking.js` (Main Application File)

```javascript
/**
 * Main booking application
 * Orchestrates calendar, form, API calls, and state management
 */

import { API_BASE_URL, DURATION_PACKAGES, AVAILABILITY_CONFIG } from './constants.js';
import { apiClient } from './api-client.js';
import { CalendarRenderer } from './calendar-renderer.js';
import { formValidator } from './form-validator.js';
import { GooglePlacesAutocomplete } from './google-places.js';
import { formatPhoneNumber, formatTime, formatDate, formatMonthYear, dateToString } from './utils.js';

// Application State
const state = {
  currentStep: 1,
  selectedDate: null,
  selectedDuration: 4, // Default to 4 hours
  selectedTime: null,
  timeSlots: [],
  isLoadingSlots: false,
};

// DOM Elements
const elements = {
  // Steps
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  successState: document.getElementById('successState'),

  // Progress
  progressSteps: document.querySelectorAll('.progress-steps .step'),

  // Calendar
  calendarDays: document.getElementById('calendarDays'),
  currentMonthLabel: document.getElementById('currentMonthLabel'),
  currentMonthBtn: document.getElementById('currentMonthBtn'),
  monthDropdown: document.getElementById('monthDropdown'),
  prevMonthBtn: document.getElementById('prevMonth'),
  nextMonthBtn: document.getElementById('nextMonth'),

  // Duration
  durationSection: document.getElementById('durationSection'),
  durationGrid: document.getElementById('durationGrid'),

  // Time Slots
  timeslotSection: document.getElementById('timeslotSection'),
  timeslotLoading: document.getElementById('timeslotLoading'),
  timeslotGrid: document.getElementById('timeslotGrid'),

  // Buttons
  continueBtn: document.getElementById('continueToDetails'),
  backBtn: document.getElementById('backToDateTime'),
  submitBtn: document.getElementById('submitBooking'),
  newBookingBtn: document.getElementById('newBooking'),

  // Form Inputs
  form: document.getElementById('bookingForm'),
  contactName: document.getElementById('contactName'),
  contactPhone: document.getElementById('contactPhone'),
  contactEmail: document.getElementById('contactEmail'),
  eventType: document.getElementById('eventType'),
  venueName: document.getElementById('venueName'),
  venueAddress: document.getElementById('venueAddress'),
  expectedAttendance: document.getElementById('expectedAttendance'),
  budgetRange: document.getElementById('budgetRange'),
  soundSystem: document.getElementById('soundSystem'),
  stageSize: document.getElementById('stageSize'),
  eventDescription: document.getElementById('eventDescription'),
  referralSource: document.getElementById('referralSource'),

  // Success
  successEventType: document.getElementById('successEventType'),
  successDate: document.getElementById('successDate'),
  successTime: document.getElementById('successTime'),
};

// Calendar Instance
let calendar;

// Google Places Instance
let placesAutocomplete;

/**
 * Initialize Application
 */
async function initialize() {
  // Initialize calendar
  calendar = new CalendarRenderer(elements.calendarDays, {
    advanceMonths: AVAILABILITY_CONFIG.advanceBookingMonths,
    onDateSelect: handleDateSelect,
  });

  calendar.render();
  updateMonthLabel();
  updateMonthDropdown();
  updateNavButtons();

  // Initialize Google Places
  try {
    placesAutocomplete = new GooglePlacesAutocomplete(elements.venueAddress);
    await placesAutocomplete.initialize();
    console.log('Google Places initialized');
  } catch (error) {
    console.error('Failed to initialize Google Places:', error);
  }

  // Attach event listeners
  attachEventListeners();

  console.log('Booking app initialized');
}

/**
 * Attach Event Listeners
 */
function attachEventListeners() {
  // Month navigation
  elements.prevMonthBtn.addEventListener('click', () => {
    calendar.prevMonth();
    updateMonthLabel();
    updateNavButtons();
  });

  elements.nextMonthBtn.addEventListener('click', () => {
    calendar.nextMonth();
    updateMonthLabel();
    updateNavButtons();
  });

  // Month dropdown
  elements.currentMonthBtn.addEventListener('click', () => {
    elements.monthDropdown.classList.toggle('hidden');
  });

  // Duration selection
  elements.durationGrid.querySelectorAll('.duration-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDurationSelect(parseInt(btn.dataset.duration));
    });
  });

  // Phone number formatting
  elements.contactPhone.addEventListener('input', (e) => {
    e.target.value = formatPhoneNumber(e.target.value);
  });

  // Form navigation
  elements.continueBtn.addEventListener('click', () => goToStep(2));
  elements.backBtn.addEventListener('click', () => goToStep(1));
  elements.newBookingBtn.addEventListener('click', resetForm);

  // Form submission
  elements.form.addEventListener('submit', handleSubmit);
}

/**
 * Update month label
 */
function updateMonthLabel() {
  const month = calendar.getCurrentMonth();
  elements.currentMonthLabel.textContent = formatMonthYear(month);
}

/**
 * Update month dropdown
 */
function updateMonthDropdown() {
  const months = calendar.getAvailableMonths();
  const currentMonth = calendar.getCurrentMonth();

  const html = months
    .map(month => {
      const isActive = month.getTime() === currentMonth.getTime();
      return `
        <div class="month-option ${isActive ? 'active' : ''}" data-month="${month.toISOString()}">
          ${formatMonthYear(month)}
        </div>
      `;
    })
    .join('');

  elements.monthDropdown.innerHTML = html;

  // Attach click handlers
  elements.monthDropdown.querySelectorAll('.month-option').forEach(option => {
    option.addEventListener('click', () => {
      const monthStr = option.dataset.month;
      const month = new Date(monthStr);
      calendar.goToMonth(month);
      updateMonthLabel();
      updateNavButtons();
      elements.monthDropdown.classList.add('hidden');
    });
  });
}

/**
 * Update navigation buttons
 */
function updateNavButtons() {
  const availableMonths = calendar.getAvailableMonths();
  const currentMonth = calendar.getCurrentMonth();
  const currentIndex = availableMonths.findIndex(
    m => m.getTime() === currentMonth.getTime()
  );

  elements.prevMonthBtn.disabled = currentIndex === 0;
  elements.nextMonthBtn.disabled = currentIndex === availableMonths.length - 1;
}

/**
 * Handle date selection
 */
function handleDateSelect(date) {
  state.selectedDate = date;

  // Show duration section
  elements.durationSection.classList.remove('hidden');

  // If duration already selected, fetch slots
  if (state.selectedDuration) {
    fetchTimeSlots();
  }

  // Update continue button
  updateContinueButton();
}

/**
 * Handle duration selection
 */
function handleDurationSelect(hours) {
  state.selectedDuration = hours;

  // Update UI
  elements.durationGrid.querySelectorAll('.duration-btn').forEach(btn => {
    btn.classList.remove('selected');
  });

  const selectedBtn = elements.durationGrid.querySelector(`[data-duration="${hours}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }

  // Fetch time slots
  if (state.selectedDate) {
    fetchTimeSlots();
  }

  updateContinueButton();
}

/**
 * Fetch available time slots
 */
async function fetchTimeSlots() {
  if (!state.selectedDate || !state.selectedDuration) return;

  state.isLoadingSlots = true;
  elements.timeslotSection.classList.remove('hidden');
  elements.timeslotLoading.classList.remove('hidden');
  elements.timeslotGrid.innerHTML = '';

  try {
    const dateStr = dateToString(state.selectedDate);
    const data = await apiClient.getAvailability(dateStr, state.selectedDuration);

    state.timeSlots = data.slots;
    renderTimeSlots();
  } catch (error) {
    console.error('Error fetching time slots:', error);
    elements.timeslotGrid.innerHTML = `
      <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        Failed to load available times. Please try again.
      </div>
    `;
  } finally {
    state.isLoadingSlots = false;
    elements.timeslotLoading.classList.add('hidden');
  }
}

/**
 * Render time slots
 */
function renderTimeSlots() {
  const html = state.timeSlots
    .map(slot => {
      const classes = ['timeslot-btn'];
      if (slot.available) classes.push('available');
      if (!slot.available) classes.push('unavailable');
      if (state.selectedTime === slot.start) classes.push('selected');

      return `
        <button
          type="button"
          class="${classes.join(' ')}"
          data-time="${slot.start}"
          ${!slot.available ? 'disabled' : ''}
        >
          ${formatTime(slot.start)}
        </button>
      `;
    })
    .join('');

  elements.timeslotGrid.innerHTML = html;

  // Attach click handlers
  elements.timeslotGrid.querySelectorAll('.timeslot-btn.available').forEach(btn => {
    btn.addEventListener('click', () => {
      handleTimeSelect(btn.dataset.time);
    });
  });
}

/**
 * Handle time selection
 */
function handleTimeSelect(time) {
  state.selectedTime = time;
  renderTimeSlots(); // Re-render to show selection
  updateContinueButton();
}

/**
 * Update continue button state
 */
function updateContinueButton() {
  const isValid = state.selectedDate && state.selectedDuration && state.selectedTime;
  elements.continueBtn.disabled = !isValid;
}

/**
 * Go to step
 */
function goToStep(step) {
  state.currentStep = step;

  // Update step visibility
  elements.step1.classList.remove('active');
  elements.step2.classList.remove('active');

  if (step === 1) {
    elements.step1.classList.add('active');
  } else if (step === 2) {
    elements.step2.classList.add('active');
  }

  // Update progress indicators
  elements.progressSteps.forEach((stepEl, index) => {
    if (index < step) {
      stepEl.classList.add('active');
    } else {
      stepEl.classList.remove('active');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();

  // Gather form data
  const formData = {
    // Date/Time
    date: dateToString(state.selectedDate),
    time: state.selectedTime,
    duration: state.selectedDuration,

    // Contact Info
    contactName: elements.contactName.value.trim(),
    contactPhone: elements.contactPhone.value.trim(),
    contactEmail: elements.contactEmail.value.trim(),

    // Event Details
    eventType: elements.eventType.value,
    venueName: elements.venueName.value.trim(),
    venueAddress: elements.venueAddress.value.trim(),
    expectedAttendance: elements.expectedAttendance.value || null,
    budgetRange: elements.budgetRange.value || null,
    soundSystem: elements.soundSystem.value || 'Unknown',
    stageSize: elements.stageSize.value.trim() || null,
    eventDescription: elements.eventDescription.value.trim(),
    referralSource: elements.referralSource.value || null,
  };

  // Validate
  const validation = formValidator.validate(formData);
  if (!validation.isValid) {
    formValidator.displayErrors(validation.errors);
    return;
  }

  // Clear any previous errors
  formValidator.clearErrors();

  // Show loading state
  const submitBtnText = elements.submitBtn.querySelector('.btn-text');
  const submitBtnLoading = elements.submitBtn.querySelector('.btn-loading');
  submitBtnText.classList.add('hidden');
  submitBtnLoading.classList.remove('hidden');
  elements.submitBtn.disabled = true;

  try {
    // Submit booking
    const result = await apiClient.createBooking(formData);

    console.log('Booking created:', result);

    // Show success state
    showSuccessState(formData);
  } catch (error) {
    console.error('Booking error:', error);

    // Show error message
    alert(
      error.message ||
        'Failed to submit booking. Please check your information and try again.'
    );

    // Reset button state
    submitBtnText.classList.remove('hidden');
    submitBtnLoading.classList.add('hidden');
    elements.submitBtn.disabled = false;
  }
}

/**
 * Show success state
 */
function showSuccessState(formData) {
  // Hide form steps
  elements.step1.classList.remove('active');
  elements.step2.classList.remove('active');

  // Show success state
  elements.successState.classList.remove('hidden');

  // Populate success details
  elements.successEventType.textContent = formData.eventType;
  elements.successDate.textContent = formatDate(state.selectedDate);
  elements.successTime.textContent = formatTime(state.selectedTime);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Reset form for new booking
 */
function resetForm() {
  // Reset state
  state.currentStep = 1;
  state.selectedDate = null;
  state.selectedDuration = 4;
  state.selectedTime = null;
  state.timeSlots = [];

  // Reset form
  elements.form.reset();

  // Hide sections
  elements.durationSection.classList.add('hidden');
  elements.timeslotSection.classList.add('hidden');
  elements.successState.classList.add('hidden');

  // Clear selections
  elements.durationGrid.querySelectorAll('.duration-btn').forEach(btn => {
    btn.classList.remove('selected');
  });

  // Go back to step 1
  goToStep(1);

  // Re-render calendar
  calendar.selectedDate = null;
  calendar.render();

  // Clear errors
  formValidator.clearErrors();

  console.log('Form reset');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
```

---

## 6. Google Places Integration

### 6.1 API Script Loading

The Google Places API script is loaded in the HTML head:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_PLACES_API_KEY&libraries=places" async defer></script>
```

**Replace `YOUR_PLACES_API_KEY`** with your actual API key from Google Cloud Console.

### 6.2 Restricting API Key

In Google Cloud Console:

1. Go to "APIs & Services" → "Credentials"
2. Click on your Places API key
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain: `https://yourbandname.github.io/*`
   - Add localhost for testing: `http://localhost:*`, `http://127.0.0.1:*`
4. Under "API restrictions":
   - Select "Restrict key"
   - Check "Places API"
5. Click "SAVE"

### 6.3 Testing Places Autocomplete

1. Open your booking page locally
2. Start typing in the "Venue Address" field
3. You should see Google's autocomplete suggestions appear
4. Select an address - it will auto-fill the field
5. Check browser console for the full place object with coordinates

---

## 7. Customization Guide

### 7.1 Change Brand Colors

Edit `booking/css/booking.css`, lines 6-10:

```css
:root {
  /* Change these to your band's colors! */
  --primary-color: #DC2626;        /* Main brand color (buttons, highlights) */
  --primary-hover: #B91C1C;        /* Darker shade for hover states */
  --secondary-color: #1A1A1A;      /* Secondary brand color */
  --accent-color: #FCD34D;         /* Accent color (today indicator, etc.) */
}
```

### 7.2 Modify Event Types

Edit `booking/js/constants.js`, lines 16-26:

```javascript
export const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', defaultDuration: 4 },
  { id: 'corporate', label: 'Corporate Event', defaultDuration: 3 },
  // Add more or remove as needed
];
```

Then update the HTML dropdown in `booking/index.html`:

```html
<select id="eventType" name="eventType" class="form-input" required>
  <option value="">Select event type</option>
  <option value="Wedding">Wedding</option>
  <option value="Corporate Event">Corporate Event</option>
  <!-- Add your event types here -->
</select>
```

### 7.3 Adjust Duration Packages

Edit `booking/js/constants.js`, lines 29-36:

```javascript
export const DURATION_PACKAGES = [
  { hours: 2, label: '2 Hours', description: 'Perfect for cocktail hours' },
  { hours: 3, label: '3 Hours', description: 'Standard set length' },
  { hours: 4, label: '4 Hours', description: 'Full event coverage' },
  { hours: 6, label: '6 Hours', description: 'Extended performance' },
  { hours: 8, label: 'Full Day (8 Hours)', description: 'All-day events' },
  // Add custom durations here
];
```

Then update HTML in `booking/index.html`:

```html
<div class="duration-grid" id="durationGrid">
  <button type="button" class="duration-btn" data-duration="2">2 Hours</button>
  <button type="button" class="duration-btn" data-duration="3">3 Hours</button>
  <!-- Update to match your packages -->
</div>
```

### 7.4 Change Buffer Time Between Gigs

Edit `lib/google-calendar.js`, line 8:

```javascript
const BUFFER_MINUTES = 60; // Change to 30, 90, 120, etc.
```

### 7.5 Change Timezone

Edit both files:

**`lib/google-calendar.js`, line 7:**
```javascript
const TIMEZONE = 'America/Los_Angeles'; // Change to your timezone
```

**`booking/js/constants.js`, line 50:**
```javascript
export const AVAILABILITY_CONFIG = {
  advanceBookingMonths: 12,
  timezone: 'America/Los_Angeles', // Change to your timezone
};
```

Valid timezone values: [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

### 7.6 Add/Remove Form Fields

To add a new field:

1. **HTML**: Add to `booking/index.html` in the form grid:
```html
<div class="form-group">
  <label for="newField">New Field Label *</label>
  <input type="text" id="newField" name="newField" class="form-input" required>
  <span class="error-message"></span>
</div>
```

2. **Validation**: Add to `booking/js/form-validator.js`:
```javascript
validate(formData) {
  // ... existing validation

  if (!formData.newField || formData.newField.length < 5) {
    this.errors.newField = 'New field is required';
  }
}
```

3. **Submit Handler**: Add to `booking/js/booking.js` in `handleSubmit()`:
```javascript
const formData = {
  // ... existing fields
  newField: elements.newField.value.trim(),
};
```

4. **Backend**: Add to `api/book.js` in `createBookingEvent()`:
```javascript
const eventDescription = `
...
NEW FIELD
━━━━━━━━━━━━━━━━━━━━
${booking.newField}
`;
```

---

## 8. Deployment

### 8.1 Deploy Backend to Vercel

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```

**Step 3: Deploy**
```bash
# From your project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? band-booking-backend
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Step 4: Set Environment Variables**

Via CLI:
```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
# Paste your service account email

vercel env add GOOGLE_PRIVATE_KEY
# Paste your private key (with \n preserved)

vercel env add GOOGLE_CALENDAR_ID
# Paste your calendar ID

vercel env add ALLOWED_ORIGIN
# Paste your GitHub Pages URL: https://yourbandname.github.io
```

Or via [Vercel Dashboard](https://vercel.com/):
1. Go to your project
2. Settings → Environment Variables
3. Add each variable
4. Redeploy to apply changes

**Step 5: Note Your Deployment URL**

Vercel will give you a URL like: `https://band-booking-backend.vercel.app`

Save this - you'll need it for the frontend configuration!

### 8.2 Deploy Backend to Netlify (Alternative)

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Login to Netlify**
```bash
netlify login
```

**Step 3: Initialize**
```bash
netlify init

# Follow prompts:
# - Create & configure new site
# - Team: (select your team)
# - Site name: band-booking-backend
# - Build command: (leave empty)
# - Directory: ./
```

**Step 4: Set Environment Variables**

Via CLI:
```bash
netlify env:set GOOGLE_SERVICE_ACCOUNT_EMAIL "your-email@project.iam.gserviceaccount.com"
netlify env:set GOOGLE_PRIVATE_KEY "-----BEGIN PRIVATE KEY-----\n..."
netlify env:set GOOGLE_CALENDAR_ID "your-calendar@group.calendar.google.com"
netlify env:set ALLOWED_ORIGIN "https://yourbandname.github.io"
```

**Step 5: Deploy**
```bash
netlify deploy --prod
```

**Step 6: Note Your Deployment URL**

Netlify will give you a URL like: `https://band-booking-backend.netlify.app`

### 8.3 Deploy Frontend to GitHub Pages

**Step 1: Update API URL**

Edit `booking/js/constants.js`, line 6:

```javascript
export const API_BASE_URL = 'https://your-backend.vercel.app'; // Your backend URL from Step 8.1 or 8.2
```

**Step 2: Update Places API Key**

Edit `booking/index.html`, line 9:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places" async defer></script>
```

Edit `booking/js/constants.js`, line 9:

```javascript
export const PLACES_API_KEY = 'YOUR_ACTUAL_API_KEY';
```

**Step 3: Create GitHub Repository**

```bash
git init
git add .
git commit -m "Initial commit: Band booking system"
git branch -M main
git remote add origin https://github.com/yourusername/band-booking.git
git push -u origin main
```

**Step 4: Enable GitHub Pages**

1. Go to your repository on GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main`, Folder: `/booking` (or `/` if booking is at root)
5. Click "Save"

**Step 5: Wait for Deployment**

GitHub will deploy your site. It will be available at:
`https://yourusername.github.io/band-booking/` (or `https://yourusername.github.io/` if using root)

**Step 6: Update CORS**

Go back to your backend deployment (Vercel/Netlify) and update the `ALLOWED_ORIGIN` environment variable to match your GitHub Pages URL exactly.

For Vercel:
```bash
vercel env rm ALLOWED_ORIGIN production
vercel env add ALLOWED_ORIGIN production
# Enter: https://yourusername.github.io

# Redeploy
vercel --prod
```

For Netlify:
```bash
netlify env:set ALLOWED_ORIGIN "https://yourusername.github.io"
netlify deploy --prod
```

### 8.4 Custom Domain (Optional)

**For GitHub Pages:**

1. Buy a domain (e.g., `yourbandname.com`)
2. In domain settings, add DNS records:
   - Type: `A`, Name: `@`, Value: `185.199.108.153`
   - Type: `A`, Name: `@`, Value: `185.199.109.153`
   - Type: `A`, Name: `@`, Value: `185.199.110.153`
   - Type: `A`, Name: `@`, Value: `185.199.111.153`
   - Type: `CNAME`, Name: `www`, Value: `yourusername.github.io`
3. In GitHub repo: Settings → Pages → Custom domain → Enter `yourbandname.com` → Save
4. Wait for DNS propagation (can take 24-48 hours)
5. Check "Enforce HTTPS"

**Update CORS for Custom Domain:**

```bash
# Vercel
vercel env rm ALLOWED_ORIGIN production
vercel env add ALLOWED_ORIGIN production
# Enter: https://yourbandname.com
vercel --prod

# Netlify
netlify env:set ALLOWED_ORIGIN "https://yourbandname.com"
netlify deploy --prod
```

**Update Google Places API Key:**

1. Google Cloud Console → Credentials → Your Places API key
2. Edit HTTP referrers
3. Add: `https://yourbandname.com/*`, `https://www.yourbandname.com/*`
4. Save

---

## 9. Testing

### 9.1 Pre-Deployment Testing (Local)

**Test Backend Locally:**

```bash
# Install Vercel CLI dev server
npm install -D vercel

# Run locally
vercel dev

# Your API will be available at:
# http://localhost:3000/api/availability
# http://localhost:3000/api/book
```

**Test Frontend Locally:**

```bash
# Use any local server, e.g.:
npx http-server booking -p 8080

# Or Python:
cd booking
python -m http.server 8080

# Open: http://localhost:8080
```

**Update API URL for Local Testing:**

Edit `booking/js/constants.js` temporarily:

```javascript
export const API_BASE_URL = 'http://localhost:3000'; // Local backend
```

### 9.2 Testing Checklist

**Availability Testing:**
- [ ] Calendar displays current month correctly
- [ ] Past dates are disabled
- [ ] Future dates (up to 12 months) are clickable
- [ ] Selecting a date shows duration options
- [ ] Selecting duration loads time slots
- [ ] Time slots show correctly (available vs unavailable)
- [ ] Already-booked times show as unavailable
- [ ] Buffer time is respected (check by booking close times)

**Booking Flow Testing:**
- [ ] Can select date, duration, and time
- [ ] "Continue" button enables only when all selected
- [ ] Step 2 form displays correctly
- [ ] All form fields are present
- [ ] Google Places autocomplete works on venue address
- [ ] Phone number auto-formats as you type
- [ ] Form validation shows errors for invalid data
- [ ] Form submission shows loading state
- [ ] Successful booking shows success message
- [ ] Success message displays correct date/time/event type
- [ ] "Book Another Event" button resets the form

**Backend Testing:**
- [ ] `/api/availability` returns slots for a valid date
- [ ] `/api/availability` returns 400 for invalid date format
- [ ] `/api/availability` returns 400 for past dates
- [ ] `/api/book` creates calendar event successfully
- [ ] `/api/book` returns 409 if slot becomes unavailable
- [ ] `/api/book` returns 400 for validation errors
- [ ] Calendar event appears in Google Calendar with correct details
- [ ] Calendar event has correct duration
- [ ] Buffer time is visible in calendar (block before/after event)

**Error Handling:**
- [ ] Network error shows user-friendly message
- [ ] Double-booking prevented (try booking same slot twice)
- [ ] Invalid form data rejected with specific error messages
- [ ] CORS errors do not occur (check browser console)
- [ ] Google Places API loads without errors

**Responsive Design:**
- [ ] Mobile (375px width): Calendar grid displays correctly
- [ ] Mobile: Form fields stack vertically
- [ ] Mobile: Buttons are full-width and touch-friendly
- [ ] Tablet (768px width): 2-column form grid
- [ ] Desktop (1200px+ width): All elements centered and readable

**Browser Compatibility:**
- [ ] Chrome/Edge (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

**Google Calendar Integration:**
- [ ] Service account has access to calendar
- [ ] Events created have correct timezone
- [ ] Event description includes all booking details
- [ ] Event location is set to venue address
- [ ] Reminders are configured (1 week, 24 hours, 2 hours before)
- [ ] Event color is set (blue #9 for gigs)
- [ ] Events sync to Google Calendar mobile app

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Issue: "Google Calendar credentials not configured"

**Cause:** Environment variables not set correctly

**Solution:**
1. Check `.env.local` exists and has all three variables
2. Verify `GOOGLE_PRIVATE_KEY` includes `\n` characters
3. Redeploy backend after adding env vars
4. Check Vercel/Netlify dashboard shows variables

**Test:**
```bash
# Vercel
vercel env ls

# Netlify
netlify env:list
```

#### Issue: "CORS error" in browser console

**Cause:** `ALLOWED_ORIGIN` doesn't match frontend URL

**Solution:**
1. Check exact frontend URL (no trailing slash)
2. Update `ALLOWED_ORIGIN` environment variable
3. Redeploy backend
4. Clear browser cache
5. Try in incognito mode

**Example:**
```bash
# Wrong
ALLOWED_ORIGIN=https://yourbandname.github.io/

# Correct
ALLOWED_ORIGIN=https://yourbandname.github.io
```

#### Issue: "Failed to fetch availability" or API returns 500

**Cause:** Google Calendar API authentication failed or quota exceeded

**Solution:**
1. Check Google Cloud Console → APIs & Services → Dashboard
2. Verify Calendar API is enabled
3. Check API quota (Calendar API: 1,000,000 requests/day - should be plenty)
4. Verify service account has access to calendar (check calendar sharing settings)
5. Test private key format (must have `\n` preserved)

**Debug:**
Add logging to `lib/google-calendar.js`:
```javascript
console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
console.log('Private Key (first 50 chars):', process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50));
```

#### Issue: Google Places autocomplete doesn't work

**Cause:** API key not loaded, restricted incorrectly, or billing not enabled

**Solution:**
1. Check browser console for Google Maps errors
2. Verify API key is correct in HTML script tag
3. Check API key restrictions (should allow your domain)
4. Enable billing on Google Cloud project (required for Places API)
5. Verify Places API is enabled in Google Cloud Console

**Test in Console:**
```javascript
console.log('Google Maps loaded:', !!window.google?.maps?.places);
```

#### Issue: Time slots show all unavailable

**Cause:** Calendar has existing events or buffer logic too aggressive

**Solution:**
1. Check Google Calendar manually - are there events on that date?
2. Review buffer time setting (reduce if needed)
3. Check timezone match between server and calendar
4. Add console logs in `getAvailableSlots()` to see what events are found

**Debug:**
In `lib/google-calendar.js`, uncomment all `console.log` statements to see event parsing

#### Issue: Booking succeeds but event doesn't appear in calendar

**Cause:** Service account doesn't have write access or wrong calendar ID

**Solution:**
1. Go to Google Calendar settings for your booking calendar
2. Verify service account email is listed under "Share with specific people"
3. Verify permission is "Make changes to events" (not just "See all event details")
4. Double-check `GOOGLE_CALENDAR_ID` environment variable matches Calendar ID in settings

#### Issue: Double bookings occur

**Cause:** Race condition or buffer logic not working

**Solution:**
1. Check that `isSlotAvailable()` is called before creating event
2. Verify buffer time is applied in both availability check and validation
3. Add delay between availability check and booking (handled by API)
4. Consider adding transaction locks (advanced)

#### Issue: Form validation not working

**Cause:** JavaScript not loading or validator not initialized

**Solution:**
1. Check browser console for JavaScript errors
2. Verify all JavaScript files are loaded (Network tab)
3. Check `type="module"` is set on script tag in HTML
4. Verify import paths are correct (case-sensitive)
5. Ensure formValidator is imported and called

#### Issue: Phone number won't format

**Cause:** Event listener not attached

**Solution:**
1. Check `formatPhoneNumber()` function exists in `utils.js`
2. Verify event listener in `booking.js`: `elements.contactPhone.addEventListener('input', ...)`
3. Check browser console for errors

#### Issue: Mobile layout broken

**Cause:** Viewport meta tag missing or CSS media queries not working

**Solution:**
1. Add to HTML `<head>`: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. Test in browser dev tools mobile view
3. Check CSS file is loaded
4. Verify media query syntax at bottom of `booking.css`

### 10.2 Debugging Tips

**Enable Verbose Logging:**

Add to `api/availability.js` and `api/book.js`:
```javascript
console.log('Request:', req.query || req.body);
console.log('Environment:', {
  hasServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
  hasCalendarId: !!process.env.GOOGLE_CALENDAR_ID,
});
```

**Test API Endpoints Directly:**

```bash
# Test availability (replace with your backend URL)
curl "https://your-backend.vercel.app/api/availability?date=2026-02-15&duration=4"

# Test booking (replace with your backend URL)
curl -X POST https://your-backend.vercel.app/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-15",
    "time": "18:00",
    "duration": 4,
    "contactName": "Test User",
    "contactPhone": "(555) 123-4567",
    "contactEmail": "test@example.com",
    "eventType": "Wedding",
    "venueName": "Test Venue",
    "venueAddress": "123 Main St, City, State",
    "eventDescription": "This is a test booking for debugging purposes."
  }'
```

**Check Vercel/Netlify Logs:**

```bash
# Vercel
vercel logs <deployment-url>

# Netlify
netlify logs
```

Or view in dashboard:
- Vercel: Project → Deployments → Click deployment → Logs
- Netlify: Site → Deploys → Click deployment → Function logs

**Browser DevTools:**

1. Open browser console (F12)
2. Go to Network tab
3. Trigger booking flow
4. Check API requests:
   - Status code (should be 200)
   - Response body
   - Request headers (check Origin for CORS)
5. Go to Console tab
6. Look for JavaScript errors

---

## 11. Appendix

### 11.1 Complete File Checklist

Ensure you have created all these files:

**Backend:**
- [ ] `lib/google-calendar.js` (Google Calendar integration)
- [ ] `lib/utils.js` (Backend utilities)
- [ ] `api/availability.js` (Availability API endpoint)
- [ ] `api/book.js` (Booking API endpoint)
- [ ] `package.json` (Dependencies)
- [ ] `.env.local` (Environment variables - NOT committed)
- [ ] `.env.example` (Environment variable template)
- [ ] `.gitignore` (Excludes secrets)
- [ ] `vercel.json` OR `netlify.toml` (Deployment config)

**Frontend:**
- [ ] `booking/index.html` (Main HTML page)
- [ ] `booking/css/booking.css` (All styles)
- [ ] `booking/js/booking.js` (Main application logic)
- [ ] `booking/js/constants.js` (Configuration)
- [ ] `booking/js/utils.js` (Frontend utilities)
- [ ] `booking/js/api-client.js` (API communication)
- [ ] `booking/js/form-validator.js` (Form validation)
- [ ] `booking/js/calendar-renderer.js` (Calendar UI)
- [ ] `booking/js/google-places.js` (Google Places autocomplete)

### 11.2 Environment Variables Reference

```bash
# Backend (.env.local)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nMultiline\nKey\nHere\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
ALLOWED_ORIGIN=https://yourbandname.github.io

# Frontend (constants.js)
API_BASE_URL=https://your-backend.vercel.app
PLACES_API_KEY=AIza...your-api-key
```

### 11.3 Useful Resources

- **Google Calendar API:** https://developers.google.com/calendar/api/v3/reference
- **Google Places API:** https://developers.google.com/maps/documentation/places/web-service
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **GitHub Pages:** https://docs.github.com/en/pages
- **IANA Timezones:** https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

### 11.4 Next Steps & Enhancements

Once your booking system is working, consider adding:

1. **Email Notifications:**
   - Use SendGrid, Mailgun, or Resend API
   - Send confirmation to customer
   - Send notification to band

2. **SMS Reminders:**
   - Use Twilio API
   - Send reminder 24 hours before gig

3. **Payment Integration:**
   - Add Stripe or Square
   - Collect deposit at booking time

4. **Admin Dashboard:**
   - View all bookings
   - Approve/reject requests
   - Manage availability manually

5. **Customer Portal:**
   - Allow customers to view/edit bookings
   - Send booking link in confirmation email

6. **Analytics:**
   - Track booking conversion rate
   - Popular event types
   - Busiest months

### 11.5 Support & Questions

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Check backend logs (Vercel/Netlify dashboard)
3. Verify all environment variables are set
4. Test API endpoints directly with curl
5. Review Google Cloud Console for API errors
6. Check service account has calendar access

**Common Gotchas:**
- Private key must preserve `\n` characters
- CORS origin must match exactly (no trailing slash)
- Google Places requires billing enabled
- Service account email must be shared with calendar
- GitHub Pages URL might be `username.github.io/repo-name/` not just `username.github.io/`

---

## Conclusion

You now have a complete, production-ready band booking system adapted from the Handyman-Sam codebase! 🎸

**What you've built:**
- ✅ Real-time availability via Google Calendar
- ✅ Duration-based booking (2-8 hour packages)
- ✅ Google Places autocomplete for venue addresses
- ✅ Two-step booking flow with validation
- ✅ Mobile-responsive design
- ✅ Serverless architecture (cost-effective & scalable)
- ✅ Buffer time management between gigs
- ✅ 24/7 availability (no business hours restriction)

**Total cost:** ~$0/month (within free tiers of Google Cloud, Vercel/Netlify, GitHub Pages)

Happy gigging! 🎶
