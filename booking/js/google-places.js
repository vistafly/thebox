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
