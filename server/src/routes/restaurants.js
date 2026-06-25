const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get restaurant suggestions for a specific week
router.get('/suggestions/:weekStartDate', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT rs.*,
       json_agg(json_build_object(
         'userId', wt.user_id,
         'walkingTimeMinutes', wt.walking_time_minutes,
         'distanceMeters', wt.distance_meters,
         'userName', u.name
       )) as walking_times
       FROM restaurant_suggestions rs
       LEFT JOIN walking_times wt ON rs.id = wt.suggestion_id
       LEFT JOIN users u ON wt.user_id = u.id
       WHERE rs.week_start_date = $1
       GROUP BY rs.id
       ORDER BY rs.created_at DESC`,
      [req.params.weekStartDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Get selected restaurant for a week
router.get('/selected/:weekStartDate', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sr.*, rs.*
       FROM selected_restaurants sr
       JOIN restaurant_suggestions rs ON sr.suggestion_id = rs.id
       WHERE sr.week_start_date = $1`,
      [req.params.weekStartDate]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Get selected restaurant error:', error);
    res.status(500).json({ error: 'Failed to fetch selected restaurant' });
  }
});

module.exports = router;
