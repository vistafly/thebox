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
  selectedDuration: null, // Will be set by user input
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
  durationInput: document.getElementById('durationInput'),

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
  // Duration input handler with validation
  elements.durationInput.addEventListener('input', (e) => {
    const duration = parseFloat(e.target.value);
    const inputWrapper = e.target.parentElement;

    // Remove any existing error styling
    inputWrapper.classList.remove('error');

    if (e.target.value === '') {
      // Clear duration if input is empty
      state.selectedDuration = null;
      elements.timeslotSection.classList.add('hidden');
      updateContinueButton();
    } else if (duration >= 1 && duration <= 12) {
      // Valid duration
      handleDurationSelect(duration);
    } else {
      // Invalid duration
      inputWrapper.classList.add('error');
      state.selectedDuration = null;
      elements.timeslotSection.classList.add('hidden');
      updateContinueButton();
    }
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

  // Clear time slots until duration is entered
  elements.timeslotSection.classList.add('hidden');
  state.selectedTime = null;

  // Only fetch slots if duration is already entered
  if (state.selectedDuration && state.selectedDuration >= 1 && state.selectedDuration <= 12) {
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

  // Fetch time slots if a date is already selected
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
  state.selectedDuration = null;
  state.selectedTime = null;
  state.timeSlots = [];

  // Reset form
  elements.form.reset();

  // Hide sections
  elements.durationSection.classList.add('hidden');
  elements.timeslotSection.classList.add('hidden');
  elements.successState.classList.add('hidden');

  // Clear duration input
  elements.durationInput.value = '';

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
