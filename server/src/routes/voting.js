const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Submit a vote
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { suggestionId, weekStartDate } = req.body;

    const result = await db.query(
      `INSERT INTO votes (user_id, suggestion_id, week_start_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, week_start_date)
       DO UPDATE SET suggestion_id = $2
       RETURNING *`,
      [req.userId, suggestionId, weekStartDate]
    );

    // Check if all users have voted
    const usersCount = await db.query('SELECT COUNT(*) FROM users WHERE google_calendar_token IS NOT NULL');
    const votesCount = await db.query('SELECT COUNT(*) FROM votes WHERE week_start_date = $1', [weekStartDate]);

    if (votesCount.rows[0].count >= usersCount.rows[0].count) {
      // All users voted - tally results
      const tallyResult = await db.query(
        `SELECT suggestion_id, COUNT(*) as vote_count
         FROM votes
         WHERE week_start_date = $1
         GROUP BY suggestion_id
         ORDER BY vote_count DESC
         LIMIT 1`,
        [weekStartDate]
      );

      if (tallyResult.rows.length > 0) {
        const winningId = tallyResult.rows[0].suggestion_id;

        // Get the suggestion details
        const suggestionResult = await db.query(
          'SELECT * FROM restaurant_suggestions WHERE id = $1',
          [winningId]
        );

        const suggestion = suggestionResult.rows[0];

        // Mark as selected
        await db.query(
          `INSERT INTO selected_restaurants (suggestion_id, week_start_date, final_date, final_time)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (week_start_date) DO NOTHING`,
          [winningId, weekStartDate, suggestion.suggested_date, suggestion.suggested_time]
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Submit vote error:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Get vote counts for a week
router.get('/:weekStartDate', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT suggestion_id, COUNT(*) as vote_count,
       json_agg(json_build_object('userId', user_id, 'userName', u.name)) as voters
       FROM votes v
       JOIN users u ON v.user_id = u.id
       WHERE week_start_date = $1
       GROUP BY suggestion_id`,
      [req.params.weekStartDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// Get current user's vote for a week
router.get('/:weekStartDate/my-vote', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM votes WHERE user_id = $1 AND week_start_date = $2',
      [req.userId, req.params.weekStartDate]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Get my vote error:', error);
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

module.exports = router;
