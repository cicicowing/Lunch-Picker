const axios = require('axios');

const GOOGLE_MAPS_API_BASE = 'https://maps.googleapis.com/maps/api';

// Get place details from Google Places API
async function getPlaceDetails(placeId) {
  try {
    const response = await axios.get(`${GOOGLE_MAPS_API_BASE}/place/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,rating,formatted_phone_number,formatted_address,geometry,price_level,types',
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    return response.data.result;
  } catch (error) {
    console.error('Google Places API error:', error.response?.data || error.message);
    throw error;
  }
}

// Search for places near a location
async function searchNearbyPlaces(latitude, longitude, options = {}) {
  const { radius = 1000, type = 'restaurant', keyword = '' } = options;

  try {
    const response = await axios.get(`${GOOGLE_MAPS_API_BASE}/place/nearbysearch/json`, {
      params: {
        location: `${latitude},${longitude}`,
        radius,
        type,
        keyword,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    return response.data.results;
  } catch (error) {
    console.error('Google Places API error:', error.response?.data || error.message);
    throw error;
  }
}

// Calculate walking time and distance from multiple origins to a destination
async function calculateWalkingTimes(origins, destination) {
  try {
    const originsString = origins
      .map(origin => `${origin.lat},${origin.lng}`)
      .join('|');

    const response = await axios.get(`${GOOGLE_MAPS_API_BASE}/distancematrix/json`, {
      params: {
        origins: originsString,
        destinations: `${destination.lat},${destination.lng}`,
        mode: 'walking',
        units: 'metric',
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    return response.data.rows.map((row, index) => ({
      userId: origins[index].userId,
      distance: row.elements[0].distance?.value || null, // meters
      duration: row.elements[0].duration?.value || null, // seconds
      walkingTimeMinutes: row.elements[0].duration?.value
        ? Math.ceil(row.elements[0].duration.value / 60)
        : null,
    }));
  } catch (error) {
    console.error('Distance Matrix API error:', error.response?.data || error.message);
    throw error;
  }
}

// Geocode an address to lat/lng
async function geocodeAddress(address) {
  try {
    const response = await axios.get(`${GOOGLE_MAPS_API_BASE}/geocode/json`, {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: response.data.results[0].formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding API error:', error.response?.data || error.message);
    throw error;
  }
}

// Calculate central point (centroid) from multiple locations
function calculateCentralPoint(locations) {
  if (locations.length === 0) return null;

  const sum = locations.reduce(
    (acc, loc) => ({
      lat: acc.lat + loc.lat,
      lng: acc.lng + loc.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / locations.length,
    lng: sum.lng / locations.length,
  };
}

module.exports = {
  getPlaceDetails,
  searchNearbyPlaces,
  calculateWalkingTimes,
  geocodeAddress,
  calculateCentralPoint,
};
