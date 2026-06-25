# Lunch Picker

A web application for coordinating weekly lunch meetups with friends working in different offices across San Francisco. The app syncs with Google Calendar, determines common availability, suggests restaurants based on group preferences, and facilitates voting.

## Features

- **User Authentication**: Secure registration and login
- **Office Location Tracking**: Each user inputs their office address once
- **Google Calendar Integration**: Automatically checks availability across all users
- **Weekly Preferences**: Users submit cuisine type, price range, and lunch duration preferences each week
- **Smart Restaurant Suggestions**: 
  - Calculates central meeting point from all office locations
  - Searches restaurants via Yelp and Google Places APIs
  - Considers majority preferences (cuisine, price, duration)
  - Generates 2 suggestions per week
- **Detailed Restaurant Info**:
  - Restaurant name, address, phone number
  - Google review score
  - Walking time from each person's office
  - Cuisine type and price level
- **Voting System**: Group votes on the 2 suggestions, majority rules
- **Automatic Selection**: Once all votes are in, the winning restaurant is automatically selected

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL database
- Google Calendar API (availability)
- Google Maps API (geocoding, distance calculations)
- Google Places API (restaurant details)
- Yelp Fusion API (restaurant search)
- JWT authentication

### Frontend
- React 18
- React Router (navigation)
- Axios (API calls)
- date-fns (date handling)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- API Keys:
  - Google Cloud Platform (Calendar, Maps, Places APIs)
  - Yelp Fusion API

### 1. Clone and Install Dependencies

```bash
cd lunch-picker

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb lunch_picker
```

Run the schema:

```bash
psql lunch_picker < server/src/db/schema.sql
```

### 3. Get API Keys

#### Google Cloud Platform APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Google Calendar API
   - Google Maps Distance Matrix API
   - Google Maps Geocoding API
   - Google Places API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
5. Create an API key for Maps/Places

#### Yelp Fusion API
1. Go to [Yelp Fusion](https://www.yelp.com/developers/documentation/v3)
2. Create an app
3. Copy your API key

### 4. Configure Environment Variables

Copy the example env file:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/lunch_picker

# Google OAuth & Calendar API
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Yelp API
YELP_API_KEY=your_actual_yelp_api_key

# Google Maps & Places API
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

## Usage Flow

### First Time Setup (Per User)
1. **Register**: Create account with name, email, password, and office address
2. **Connect Google Calendar**: Grant calendar access to sync availability

### Weekly Workflow
1. **Monday Morning**: System automatically generates 2 restaurant suggestions
2. **Set Preferences**: Each user submits their preferences for the week
   - Cuisine type (sushi, Mexican, Italian, etc.)
   - Price level ($ to $$$$)
   - Lunch duration (quick 30min, standard 1hr, extended 1.5hr)
3. **Vote**: Users see 2 suggestions with details and vote for their favorite
4. **Auto-Select**: Once everyone votes, the winner is automatically chosen
5. **View Details**: Dashboard shows the selected restaurant with all info

## How Restaurant Selection Works

1. **Availability Check**: System checks each user's Google Calendar for conflicts
2. **Find Common Time**: Identifies lunch slots (11 AM - 2 PM) when everyone is free
3. **Aggregate Preferences**: Tallies votes for cuisine, price, and duration (majority rules)
4. **Calculate Central Point**: Computes geographic center from all office locations
5. **Search Restaurants**: Queries Yelp/Google Places near the central point
6. **Rank Results**: Sorts by rating and relevance
7. **Calculate Walking Times**: Gets walking distance/time for each user using Google Maps
8. **Present Top 2**: Shows best matches with full details

## Project Structure

```
lunch-picker/
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js          # Database connection
│   │   │   └── schema.sql        # Database schema
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js           # Auth endpoints
│   │   │   ├── users.js          # User endpoints
│   │   │   ├── preferences.js    # Preference endpoints
│   │   │   ├── restaurants.js    # Restaurant endpoints
│   │   │   ├── voting.js         # Voting endpoints
│   │   │   └── availability.js   # Calendar sync
│   │   ├── services/
│   │   │   ├── googleCalendar.js # Calendar API integration
│   │   │   ├── yelpService.js    # Yelp API integration
│   │   │   ├── googleMapsService.js # Maps/Places API
│   │   │   └── suggestionService.js # Core suggestion logic
│   │   └── index.js              # Express app
│   └── package.json
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Preferences.js
│   │   │   ├── Suggestions.js
│   │   │   └── Header.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Scheduled Jobs

The app uses `node-cron` to run weekly tasks:

- **Every Monday at 9 AM**: Generates restaurant suggestions for the week
  - Checks everyone's calendar availability
  - Aggregates preferences
  - Searches restaurants
  - Calculates walking times
  - Stores top 2 suggestions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google-calendar/auth-url` - Get OAuth URL
- `POST /api/auth/google-calendar/callback` - Handle OAuth callback

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users

### Preferences
- `POST /api/preferences` - Submit weekly preferences
- `GET /api/preferences/:weekStartDate` - Get user's preferences
- `GET /api/preferences/:weekStartDate/summary` - Get all preferences

### Restaurants
- `GET /api/restaurants/suggestions/:weekStartDate` - Get suggestions
- `GET /api/restaurants/selected/:weekStartDate` - Get selected restaurant

### Voting
- `POST /api/voting` - Submit vote
- `GET /api/voting/:weekStartDate` - Get vote counts
- `GET /api/voting/:weekStartDate/my-vote` - Get user's vote

### Availability
- `GET /api/availability/sync/:weekStartDate` - Sync calendar

## Future Enhancements

- Push notifications when suggestions are ready
- SMS reminders on lunch day
- Restaurant reservation integration (OpenTable, Resy)
- Dietary restrictions (vegetarian, vegan, gluten-free)
- Past lunch history and favorites
- Group chat integration (Slack, Discord)
- Mobile app (React Native)
- More sophisticated scheduling algorithm
- Weather-based suggestions (indoor vs outdoor seating)

## Contributing

This is a personal project for coordinating lunches with friends. Feel free to fork and adapt for your own group!

## License

MIT
