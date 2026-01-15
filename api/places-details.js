/**
 * Google Places Details Proxy API
 * Securely proxies Places Details API requests to prevent key exposure
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
    const { placeId, sessionToken } = req.body;

    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Google Places Details API
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('fields', 'formatted_address,name,geometry,place_id,address_components');

    if (sessionToken) {
      url.searchParams.append('sessiontoken', sessionToken);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === 'OK') {
      return res.status(200).json({
        result: data.result,
        status: data.status
      });
    } else {
      console.error('Google Places Details API error:', data);
      return res.status(500).json({
        error: 'Failed to fetch place details',
        status: data.status
      });
    }
  } catch (error) {
    console.error('Places details error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
