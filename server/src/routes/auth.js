const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { getAuthUrl, getTokensFromCode } = require('../services/googleCalendar');
const { geocodeAddress } = require('../services/googleMapsService');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, name, password, officeAddress } = req.body;

    // Geocode office address
    const location = await geocodeAddress(officeAddress);
    if (!location) {
      return res.status(400).json({ error: 'Invalid office address' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, name, password_hash, office_address, office_lat, office_lng)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, office_address`,
      [email, name, passwordHash, location.formatted_address, location.lat, location.lng]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ user, token });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        office_address: user.office_address,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Google Calendar OAuth URL
router.get('/google-calendar/auth-url', (req, res) => {
  const authUrl = getAuthUrl();
  res.json({ authUrl });
});

// Handle Google Calendar OAuth callback
router.post('/google-calendar/callback', async (req, res) => {
  try {
    const { code, userId } = req.body;

    const tokens = await getTokensFromCode(code);

    await db.query(
      `UPDATE users SET google_calendar_token = $1, google_refresh_token = $2 WHERE id = $3`,
      [tokens.access_token, tokens.refresh_token, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

module.exports = router;
