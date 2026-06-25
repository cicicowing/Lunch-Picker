require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const availabilityRoutes = require('./routes/availability');
const preferencesRoutes = require('./routes/preferences');
const restaurantRoutes = require('./routes/restaurants');
const votingRoutes = require('./routes/voting');

const { generateWeeklySuggestions } = require('./services/suggestionService');

const app = express();

// Auto-create database tables on first startup
const fs = require('fs');
const path = require('path');
if (process.env.AUTO_MIGRATE === 'true') {
 const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
 const db = require('./db');
 db.query(schema).then(() => console.log('✅ Database schema created')).catch(console.error);
}

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/voting', votingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Schedule weekly restaurant suggestions (every Monday at 9 AM)
cron.schedule('0 9 * * 1', async () => {
  console.log('Running weekly restaurant suggestion generation...');
  try {
    await generateWeeklySuggestions();
    console.log('Weekly suggestions generated successfully');
  } catch (error) {
    console.error('Error generating weekly suggestions:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

