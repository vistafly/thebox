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
