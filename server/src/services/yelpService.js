const axios = require('axios');

const YELP_API_BASE = 'https://api.yelp.com/v3';

async function searchRestaurants(latitude, longitude, options = {}) {
  const {
    cuisineType = null,
    priceLevel = null,
    radius = 1000, // meters
    limit = 20,
  } = options;

  try {
    const params = {
      latitude,
      longitude,
      radius,
      limit,
      categories: cuisineType ? mapCuisineToYelpCategory(cuisineType) : 'restaurants',
      open_now: true,
    };

    if (priceLevel) {
      params.price = Array.from({ length: priceLevel }, (_, i) => i + 1).join(',');
    }

    const response = await axios.get(`${YELP_API_BASE}/businesses/search`, {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
      params,
    });

    return response.data.businesses.map(business => ({
      id: business.id,
      name: business.name,
      rating: business.rating,
      review_count: business.review_count,
      price: business.price ? business.price.length : null,
      phone: business.phone,
      address: business.location.display_address.join(', '),
      coordinates: business.coordinates,
      categories: business.categories.map(c => c.title),
      url: business.url,
    }));
  } catch (error) {
    console.error('Yelp API error:', error.response?.data || error.message);
    throw error;
  }
}

async function getBusinessDetails(yelpId) {
  try {
    const response = await axios.get(`${YELP_API_BASE}/businesses/${yelpId}`, {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Yelp API error:', error.response?.data || error.message);
    throw error;
  }
}

function mapCuisineToYelpCategory(cuisineType) {
  const mapping = {
    sushi: 'sushi',
    japanese: 'japanese',
    mexican: 'mexican',
    italian: 'italian',
    chinese: 'chinese',
    thai: 'thai',
    indian: 'indian',
    korean: 'korean',
    vietnamese: 'vietnamese',
    american: 'newamerican',
    burgers: 'burgers',
    pizza: 'pizza',
    sandwiches: 'sandwiches',
    salad: 'salad',
    mediterranean: 'mediterranean',
  };

  return mapping[cuisineType.toLowerCase()] || 'restaurants';
}

module.exports = {
  searchRestaurants,
  getBusinessDetails,
};
