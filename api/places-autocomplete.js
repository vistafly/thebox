/**
 * Google Places Autocomplete Proxy API
 * Securely proxies Places API requests to prevent key exposure
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:8080';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { input, sessionToken } = req.body;

    if (!input || input.trim().length === 0) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Google Places Autocomplete API
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.append('input', input);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('types', 'establishment|geocode');

    if (sessionToken) {
      url.searchParams.append('sessiontoken', sessionToken);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return res.status(200).json({
        predictions: data.predictions || [],
        status: data.status
      });
    } else {
      console.error('Google Places API error:', data);
      return res.status(500).json({
        error: 'Failed to fetch autocomplete results',
        status: data.status
      });
    }
  } catch (error) {
    console.error('Places autocomplete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
