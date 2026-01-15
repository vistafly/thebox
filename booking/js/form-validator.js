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
