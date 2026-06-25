const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get availability from Google Calendar for current user
router.get('/sync/:weekStartDate', authenticateToken, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT google_calendar_token, google_refresh_token FROM users WHERE id = $1',
      [req.userId]
    );

    if (!userResult.rows[0]?.google_calendar_token) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    const { getUserAvailability } = require('../services/googleCalendar');
    const events = await getUserAvailability(
      userResult.rows[0].google_calendar_token,
      userResult.rows[0].google_refresh_token,
      req.params.weekStartDate
    );

    res.json({ events });
  } catch (error) {
    console.error('Sync availability error:', error);
    res.status(500).json({ error: 'Failed to sync availability' });
  }
});

module.exports = router;
