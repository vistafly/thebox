/**
 * Google Places Autocomplete integration
 * Uses secure backend proxy to prevent API key exposure
 */

import { API_BASE_URL } from './constants.js';

export class GooglePlacesAutocomplete {
  constructor(inputElement) {
    this.inputElement = inputElement;
    this.selectedPlace = null;
    this.sessionToken = this.generateSessionToken();
    this.debounceTimer = null;
    this.suggestionsContainer = null;
  }

  generateSessionToken() {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  }

  async initialize() {
    // Create suggestions dropdown
    this.suggestionsContainer = document.createElement('div');
    this.suggestionsContainer.className = 'places-suggestions';
    this.suggestionsContainer.style.display = 'none';

    // Ensure parent has relative positioning
    const parent = this.inputElement.parentNode;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(this.suggestionsContainer);

    // Listen for input
    this.inputElement.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.inputElement.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  handleInput(value) {
    clearTimeout(this.debounceTimer);

    if (!value || value.trim().length < 3) {
      this.hideSuggestions();
      return;
    }

    // Debounce API calls
    this.debounceTimer = setTimeout(() => {
      this.fetchPredictions(value);
    }, 300);
  }

  async fetchPredictions(input) {
    try {
      console.log('Fetching predictions for:', input);
      const response = await fetch(`${API_BASE_URL}/api/places-autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          sessionToken: this.sessionToken
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(`Failed to fetch predictions: ${response.status}`);
      }

      const data = await response.json();
      console.log('Predictions received:', data.predictions?.length || 0);
      this.displaySuggestions(data.predictions || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      this.hideSuggestions();
    }
  }

  displaySuggestions(predictions) {
    if (predictions.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestionsContainer.innerHTML = '';
    this.suggestionsContainer.style.display = 'block';

    predictions.forEach(prediction => {
      const item = document.createElement('div');
      item.className = 'places-suggestion-item';
      item.textContent = prediction.description;

      item.addEventListener('click', () => {
        this.selectPlace(prediction.place_id, prediction.description);
      });

      this.suggestionsContainer.appendChild(item);
    });
  }

  hideSuggestions() {
    this.suggestionsContainer.style.display = 'none';
  }

  async selectPlace(placeId, description) {
    this.hideSuggestions();
    this.inputElement.value = description;

    try {
      const response = await fetch(`${API_BASE_URL}/api/places-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId,
          sessionToken: this.sessionToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const data = await response.json();
      const place = data.result;

      this.selectedPlace = {
        address: place.formatted_address,
        name: place.name,
        placeId: place.place_id,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      };

      console.log('Selected place:', this.selectedPlace);

      // Generate new session token for next search
      this.sessionToken = this.generateSessionToken();
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  }

  getSelectedPlace() {
    return this.selectedPlace;
  }
}
