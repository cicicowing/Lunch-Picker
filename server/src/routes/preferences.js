const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Submit weekly preferences
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { weekStartDate, cuisineType, priceLevel, lunchDuration } = req.body;

    const result = await db.query(
      `INSERT INTO weekly_preferences (user_id, week_start_date, cuisine_type, price_level, lunch_duration)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, week_start_date)
       DO UPDATE SET cuisine_type = $3, price_level = $4, lunch_duration = $5
       RETURNING *`,
      [req.userId, weekStartDate, cuisineType, priceLevel, lunchDuration]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Submit preferences error:', error);
    res.status(500).json({ error: 'Failed to submit preferences' });
  }
});

// Get user's preferences for a week
router.get('/:weekStartDate', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM weekly_preferences WHERE user_id = $1 AND week_start_date = $2',
      [req.userId, req.params.weekStartDate]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Get all users' preferences for a week (summary)
router.get('/:weekStartDate/summary', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT wp.*, u.name as user_name
       FROM weekly_preferences wp
       JOIN users u ON wp.user_id = u.id
       WHERE wp.week_start_date = $1`,
      [req.params.weekStartDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get preferences summary error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences summary' });
  }
});

module.exports = router;
