# Lunch Picker Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (5-9 friends)                      │
│                    Working in SF offices                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Port 3000)                    │
│  ┌──────────────┬────────────────┬──────────────┬─────────────┐ │
│  │   Login/     │   Dashboard    │ Preferences  │   Voting    │ │
│  │   Register   │                │              │             │ │
│  └──────────────┴────────────────┴──────────────┴─────────────┘ │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP/REST API
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXPRESS BACKEND (Port 5000)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API ROUTES                             │   │
│  │  /auth  /users  /preferences  /restaurants  /voting      │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                          │
│  ┌────────────────────┴─────────────────────────────────────┐   │
│  │                   CORE SERVICES                           │   │
│  │  • suggestionService.js (main coordination logic)        │   │
│  │  • googleCalendar.js (availability checking)             │   │
│  │  • yelpService.js (restaurant search)                    │   │
│  │  • googleMapsService.js (location & walking times)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           CRON JOB (Every Monday 9 AM)                   │   │
│  │           Triggers suggestionService                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬──────────────┐
        ▼               ▼               ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────────┐
│  PostgreSQL  │ │   Google    │ │   Yelp   │ │Google Maps & │
│   Database   │ │  Calendar   │ │ Fusion   │ │   Places     │
│              │ │     API     │ │   API    │ │     APIs     │
└──────────────┘ └─────────────┘ └──────────┘ └──────────────┘
```

## Data Flow

### Weekly Suggestion Generation Flow

```
1. CRON TRIGGER (Monday 9 AM)
   ↓
2. Fetch all users + office locations from DB
   ↓
3. PARALLEL: Check each user's Google Calendar for availability
   ↓
4. Find common free lunch slots (11 AM - 2 PM)
   ↓
5. Fetch user preferences for this week from DB
   ↓
6. Calculate majority preferences:
   - Cuisine type (most votes wins)
   - Price level (average)
   - Duration (most common)
   ↓
7. Calculate geographic center of all offices
   ↓
8. Search Yelp for restaurants near center
   - Filter by cuisine
   - Filter by price
   - Filter by open now
   ↓
9. For top 2 restaurants:
   - Get Google Places details (rating, phone)
   - Calculate walking time for EACH user
   - Store in DB
   ↓
10. DONE - Users can now vote
```

### User Voting Flow

```
1. User views 2 suggestions
   ↓
2. Each suggestion shows:
   - Restaurant details
   - Walking time from THEIR office
   - Walking times for all group members
   - Current vote count
   ↓
3. User clicks "Vote"
   ↓
4. Vote recorded in DB (one vote per user per week)
   ↓
5. Backend checks: Have all users voted?
   ↓
6. If YES → Tally votes → Mark winner as "selected"
   ↓
7. Dashboard shows selected restaurant
```

## Database Schema

```
users
├── id (PK)
├── email (unique)
├── name
├── password_hash
├── office_address
├── office_lat
├── office_lng
├── google_calendar_token
└── google_refresh_token

weekly_preferences
├── id (PK)
├── user_id (FK → users)
├── week_start_date
├── cuisine_type
├── price_level (1-4)
└── lunch_duration (quick/standard/extended)

restaurant_suggestions
├── id (PK)
├── week_start_date
├── restaurant_name
├── address
├── lat, lng
├── cuisine_type
├── price_level
├── google_rating
├── yelp_rating
├── phone_number
├── suggested_date
└── suggested_time

walking_times
├── id (PK)
├── suggestion_id (FK → restaurant_suggestions)
├── user_id (FK → users)
├── walking_time_minutes
└── distance_meters

votes
├── id (PK)
├── user_id (FK → users)
├── suggestion_id (FK → restaurant_suggestions)
├── week_start_date
└── voted_at

selected_restaurants
├── id (PK)
├── suggestion_id (FK → restaurant_suggestions)
├── week_start_date (unique)
├── final_date
└── final_time
```

## API Integrations

### Google Calendar API
**Purpose**: Check user availability
- **Auth**: OAuth 2.0
- **Endpoint**: `calendar.events.list`
- **Usage**: Fetch events for week, identify conflicts

### Yelp Fusion API
**Purpose**: Search restaurants
- **Auth**: API Key (Bearer token)
- **Endpoint**: `/businesses/search`
- **Params**: lat/lng, cuisine, price, radius

### Google Places API
**Purpose**: Get detailed restaurant info
- **Auth**: API Key
- **Endpoint**: `/place/details/json`
- **Usage**: Get rating, phone number, reviews

### Google Maps APIs

#### Geocoding API
**Purpose**: Convert office addresses to coordinates
- **Endpoint**: `/geocode/json`
- **Usage**: One-time when user registers

#### Distance Matrix API
**Purpose**: Calculate walking times
- **Endpoint**: `/distancematrix/json`
- **Usage**: For each suggestion, calculate time from all offices

## Key Algorithms

### Central Point Calculator
```javascript
function calculateCentralPoint(locations) {
  // Simple centroid calculation
  avgLat = sum(all latitudes) / count
  avgLng = sum(all longitudes) / count
  return { lat: avgLat, lng: avgLng }
}
```

### Majority Preference Algorithm
```javascript
// Cuisine: Most votes wins
cuisineVotes = { sushi: 3, mexican: 2 }
winner = "sushi" (3 > 2)

// Price: Average
priceLevels = [2, 2, 3, 1, 2]
average = sum / count = 10 / 5 = 2

// Duration: Most common
durations = [quick, standard, standard, extended, standard]
mode = "standard" (appears 3 times)
```

### Common Availability Finder
```javascript
for each day (Mon-Fri):
  for each 15-min slot (11:00 AM to 2:00 PM):
    if ALL users are free for [duration] minutes:
      add to availableSlots
return availableSlots
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 30-day expiration
- **API Authentication**: All protected routes require Bearer token
- **OAuth Tokens**: Securely stored encrypted in DB
- **Input Validation**: All user inputs sanitized
- **SQL Injection Protection**: Parameterized queries

## Scalability Considerations

### Current Capacity
- Designed for 5-9 users
- Single PostgreSQL instance
- No caching layer

### If Scaling to 100+ Users
1. **Database**: 
   - Connection pooling
   - Read replicas
   - Indexing optimization

2. **Caching**:
   - Redis for API responses
   - Cache restaurant searches
   - Cache walking times

3. **API Rate Limits**:
   - Batch API calls
   - Request queuing
   - Fallback strategies

4. **Multiple Groups**:
   - Add `group_id` to all tables
   - Group-based isolation
   - Group admin roles

## Deployment Architecture (Production)

```
Internet
  ↓
[Load Balancer / CloudFlare]
  ↓
[HTTPS / SSL]
  ↓
[Docker Container]
  ├── Nginx (reverse proxy)
  ├── Node.js Backend
  └── React Frontend (static build)
  ↓
[PostgreSQL Cloud DB]
  (AWS RDS / Heroku Postgres)
  
External Services:
  - Google Cloud APIs
  - Yelp Fusion API
```

## Technology Choices Rationale

| Technology | Why Chosen |
|------------|-----------|
| **React** | Modern, component-based, large ecosystem |
| **Node.js + Express** | JavaScript full-stack, async I/O, good API support |
| **PostgreSQL** | Relational data, ACID compliance, PostGIS for geo |
| **JWT** | Stateless auth, easy to scale horizontally |
| **Google Calendar** | Most widely used, good API, OAuth standard |
| **Yelp API** | Comprehensive restaurant data, reviews |
| **Google Maps** | Accurate walking directions, geocoding |

## Future Architecture Improvements

1. **Microservices Split**:
   - User Service
   - Restaurant Service  
   - Calendar Service
   - Voting Service

2. **Message Queue**:
   - Use RabbitMQ/Bull for async tasks
   - Decouple suggestion generation

3. **Real-time Updates**:
   - WebSockets for live voting
   - Push notifications

4. **Mobile Apps**:
   - React Native with shared API
   - Push notifications

5. **AI/ML Enhancements**:
   - Learn from past lunches
   - Predict preferences
   - Recommend new cuisine types
