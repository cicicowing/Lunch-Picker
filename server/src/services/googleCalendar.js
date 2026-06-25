const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate auth URL for user to grant calendar access
function getAuthUrl() {
  const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

// Exchange authorization code for tokens
async function getTokensFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Get user's availability for a specific week
async function getUserAvailability(accessToken, refreshToken, weekStartDate) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const weekStart = new Date(weekStartDate);
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 5); // Monday to Friday

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: weekStart.toISOString(),
      timeMax: weekEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

// Find common free time slots during lunch hours (11 AM - 2 PM)
function findCommonLunchSlots(allUsersEvents, duration = 'standard') {
  const lunchDurations = {
    quick: 30, // 30 minutes
    standard: 60, // 1 hour
    extended: 90, // 1.5 hours
  };

  const requiredMinutes = lunchDurations[duration] || 60;

  // Implementation would check each day 11 AM - 2 PM for conflicts
  // Returns array of available time slots across all users

  // This is a simplified version - full implementation would:
  // 1. For each day Mon-Fri
  // 2. For each 15-min slot from 11 AM to 2 PM
  // 3. Check if ALL users are free for requiredMinutes
  // 4. Return slots where everyone is available

  return []; // Placeholder
}

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  getUserAvailability,
  findCommonLunchSlots,
};
