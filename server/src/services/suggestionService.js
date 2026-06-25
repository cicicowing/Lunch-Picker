const db = require('../db');
const { getUserAvailability, findCommonLunchSlots } = require('./googleCalendar');
const { searchRestaurants } = require('./yelpService');
const { calculateCentralPoint, calculateWalkingTimes, getPlaceDetails } = require('./googleMapsService');

async function generateWeeklySuggestions() {
  // Get current week start (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + daysUntilMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekStartStr = weekStart.toISOString().split('T')[0];

  try {
    // 1. Get all active users
    const usersResult = await db.query('SELECT * FROM users WHERE google_calendar_token IS NOT NULL');
    const users = usersResult.rows;

    if (users.length < 2) {
      console.log('Not enough users with calendar access');
      return;
    }

    // 2. Get weekly preferences for all users
    const prefsResult = await db.query(
      'SELECT * FROM weekly_preferences WHERE week_start_date = $1',
      [weekStartStr]
    );
    const preferences = prefsResult.rows;

    // 3. Determine majority preferences
    const cuisineVotes = {};
    const priceLevels = [];
    const durations = [];

    preferences.forEach(pref => {
      if (pref.cuisine_type) {
        cuisineVotes[pref.cuisine_type] = (cuisineVotes[pref.cuisine_type] || 0) + 1;
      }
      if (pref.price_level) priceLevels.push(pref.price_level);
      if (pref.lunch_duration) durations.push(pref.lunch_duration);
    });

    const majorityCuisine = Object.keys(cuisineVotes).reduce((a, b) =>
      cuisineVotes[a] > cuisineVotes[b] ? a : b
    , null);

    const avgPriceLevel = priceLevels.length > 0
      ? Math.round(priceLevels.reduce((a, b) => a + b, 0) / priceLevels.length)
      : 2;

    const majorityDuration = getMajorityValue(durations) || 'standard';

    // 4. Check calendar availability for all users
    const allUsersEvents = [];
    for (const user of users) {
      const events = await getUserAvailability(
        user.google_calendar_token,
        user.google_refresh_token,
        weekStartStr
      );
      allUsersEvents.push({ userId: user.id, events });
    }

    // 5. Find common lunch time slots
    const availableSlots = findCommonLunchSlots(allUsersEvents, majorityDuration);

    if (availableSlots.length === 0) {
      console.log('No common availability found');
      return;
    }

    // Pick the first available slot
    const selectedSlot = availableSlots[0];

    // 6. Calculate central meeting point
    const userLocations = users.map(u => ({
      userId: u.id,
      lat: parseFloat(u.office_lat),
      lng: parseFloat(u.office_lng),
    }));

    const centralPoint = calculateCentralPoint(userLocations);

    // 7. Search for restaurants near central point
    const restaurants = await searchRestaurants(
      centralPoint.lat,
      centralPoint.lng,
      {
        cuisineType: majorityCuisine,
        priceLevel: avgPriceLevel,
        radius: 1500,
        limit: 10,
      }
    );

    if (restaurants.length < 2) {
      console.log('Not enough restaurants found');
      return;
    }

    // 8. Get top 2 restaurants and calculate walking times
    const topRestaurants = restaurants.slice(0, 2);

    for (const restaurant of topRestaurants) {
      // Get Google Place details for additional info
      const placeDetails = await getPlaceDetails(restaurant.place_id);

      // Insert restaurant suggestion
      const suggestionResult = await db.query(
        `INSERT INTO restaurant_suggestions
        (week_start_date, restaurant_name, address, lat, lng, cuisine_type, price_level,
         google_rating, yelp_rating, yelp_id, phone_number, suggested_date, suggested_time, lunch_duration)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          weekStartStr,
          restaurant.name,
          restaurant.address,
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude,
          restaurant.categories[0] || null,
          restaurant.price,
          placeDetails?.rating || null,
          restaurant.rating,
          restaurant.id,
          restaurant.phone,
          selectedSlot.date,
          selectedSlot.time,
          majorityDuration,
        ]
      );

      const suggestionId = suggestionResult.rows[0].id;

      // Calculate walking times for all users
      const walkingTimes = await calculateWalkingTimes(
        userLocations,
        {
          lat: restaurant.coordinates.latitude,
          lng: restaurant.coordinates.longitude,
        }
      );

      // Insert walking times
      for (const wt of walkingTimes) {
        await db.query(
          `INSERT INTO walking_times (suggestion_id, user_id, walking_time_minutes, distance_meters)
          VALUES ($1, $2, $3, $4)`,
          [suggestionId, wt.userId, wt.walkingTimeMinutes, wt.distance]
        );
      }
    }

    console.log(`Generated ${topRestaurants.length} restaurant suggestions for week ${weekStartStr}`);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw error;
  }
}

function getMajorityValue(arr) {
  if (arr.length === 0) return null;
  const counts = {};
  arr.forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
  });
  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}

module.exports = {
  generateWeeklySuggestions,
};
