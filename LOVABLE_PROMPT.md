# Lunch Coordination Web App - Lovable Prompt

## Project Overview
Create a web application for coordinating weekly lunch meetups between 5-9 friends working in different offices across San Francisco.

## Core Features

### 1. User Management
- User registration and authentication system
- Each user profile stores:
  - Name, email, password
  - Office address in San Francisco (input once, stored permanently)
  - Google Calendar OAuth token
- Support for 5 users minimum, up to 9 users maximum

### 2. Google Calendar Integration
- OAuth 2.0 integration with Google Calendar API
- Each user connects their Google Calendar (one-time setup)
- App checks calendar availability automatically
- Looks for free time slots Monday-Friday between 11 AM - 2 PM
- Only suggests times when ALL users are available

### 3. Weekly Preferences System
- Each user submits preferences once per week:
  - **Cuisine type**: Dropdown with options (sushi, Mexican, Italian, Chinese, Thai, Indian, Korean, Vietnamese, American, burgers, pizza, sandwiches, salad, Mediterranean)
  - **Price range**: 1-4 dollar signs ($ budget, $$ moderate, $$$ upscale, $$$$ fancy)
  - **Lunch duration**: 3 options (quick 30min, standard 1hr, extended 1.5hrs)
- Preferences are for the current week only
- Users can update preferences anytime before suggestions are generated

### 4. Restaurant Suggestion Algorithm
The app automatically generates 2 restaurant suggestions every Monday at 9 AM:

**Step 1: Check Availability**
- Query each user's Google Calendar for the week
- Find common free time slots during lunch hours (11 AM - 2 PM)
- Respect the duration preference (30min, 1hr, or 1.5hr)

**Step 2: Calculate Preferences (Majority Rules)**
- Cuisine: Most voted cuisine wins (e.g., 3 votes sushi > 2 votes Mexican)
- Price: Average of all price preferences (e.g., 2+2+3+1+2 = 2 average)
- Duration: Most common duration selection

**Step 3: Calculate Central Location**
- Get coordinates (latitude, longitude) for each user's office
- Calculate geographic center point (centroid)
- This ensures the meeting spot is fair to everyone

**Step 4: Search Restaurants**
- Use Yelp Fusion API to search restaurants near the central point
- Filter by:
  - Cuisine type (from majority preference)
  - Price level (from average preference)
  - Currently open
  - Within 1000-1500 meters radius
- Get top 10 matches

**Step 5: Enrich with Google Places Data**
- For each restaurant, get details from Google Places API:
  - Google rating (out of 5 stars)
  - Phone number
  - Formatted address

**Step 6: Calculate Walking Times**
- Use Google Maps Distance Matrix API
- For EACH user, calculate:
  - Walking distance (meters)
  - Walking time (minutes)
- Store walking times for all users for each restaurant

**Step 7: Select Top 2**
- Pick the 2 highest-rated restaurants
- Store as suggestions for the week

### 5. Restaurant Suggestion Display
Each restaurant suggestion shows:
- Restaurant name
- Full address
- Phone number to contact
- Google review score (out of 5 stars)
- Yelp rating (out of 5 stars)
- Price level ($ symbols)
- Cuisine type
- Suggested date and time (when everyone is free)
- **Walking time from EACH person's office** (show all users)
- **Highlighted: Current user's walking time**

### 6. Voting System
- Users see the 2 restaurant suggestions
- Each user can vote for ONE restaurant
- Users can change their vote anytime
- Show current vote counts for each restaurant
- When all users have voted:
  - Automatically tally votes
  - Most votes wins (majority rules)
  - Mark winner as "selected"
  - Display on dashboard

### 7. Dashboard
Shows:
- Current week's selected restaurant (if voting is complete)
- User's office location
- Quick links to set preferences and vote
- Google Calendar connection status

## Technical Requirements

### Frontend
- React with TypeScript or JavaScript
- Responsive design (works on desktop and mobile)
- Clean, modern UI with easy navigation
- Pages needed:
  - Login/Register
  - Dashboard
  - My Preferences
  - Vote on Suggestions
  - User Settings

### Backend
- RESTful API
- Authentication with JWT tokens
- Database for storing:
  - Users (name, email, password, office location)
  - Weekly preferences
  - Restaurant suggestions
  - Walking times (per user, per restaurant)
  - Votes
  - Selected restaurants

### Database Schema
Tables needed:
1. **users** - id, email, name, password_hash, office_address, office_lat, office_lng, google_calendar_token
2. **weekly_preferences** - id, user_id, week_start_date, cuisine_type, price_level, lunch_duration
3. **restaurant_suggestions** - id, week_start_date, name, address, lat, lng, cuisine, price_level, google_rating, yelp_rating, phone_number, suggested_date, suggested_time
4. **walking_times** - id, suggestion_id, user_id, walking_time_minutes, distance_meters
5. **votes** - id, user_id, suggestion_id, week_start_date
6. **selected_restaurants** - id, suggestion_id, week_start_date, final_date, final_time

### External APIs to Integrate

**Required APIs:**
1. **Google Calendar API** - Check user availability
2. **Google Maps Geocoding API** - Convert office addresses to coordinates
3. **Google Maps Distance Matrix API** - Calculate walking times from each office
4. **Google Places API** - Get restaurant details and ratings
5. **Yelp Fusion API** - Search restaurants by location, cuisine, price

### Scheduled Jobs
- Weekly task runs every Monday at 9:00 AM
- Triggers the restaurant suggestion algorithm
- Generates 2 suggestions for the current week

## User Flow

### First-Time Setup (Per User)
1. User registers with name, email, password
2. User enters SF office address (e.g., "50 Fremont St, San Francisco, CA")
3. System geocodes address to coordinates
4. User connects Google Calendar (OAuth flow)
5. Done! Ready to use

### Weekly Workflow
**Sunday Evening:**
- User logs in
- Goes to "My Preferences"
- Selects cuisine, price, duration
- Submits preferences

**Monday 9 AM (Automatic):**
- System checks all calendars
- Finds common availability
- Tallies preferences
- Searches restaurants
- Calculates walking times
- Generates 2 suggestions

**Monday/Tuesday:**
- User logs in
- Goes to "Vote"
- Sees 2 restaurant options with all details
- Clicks vote button for favorite
- Can change vote anytime

**After All Votes:**
- System automatically picks winner
- Dashboard updates with selected restaurant
- Shows: name, address, phone, date, time

**Lunch Day:**
- Users see details on dashboard
- Call restaurant if needed
- Show up and enjoy!

## UI/UX Requirements

### Design Style
- Clean, modern, friendly
- Food-related color scheme (warm oranges, greens)
- Easy to read text
- Clear call-to-action buttons
- Mobile-responsive

### Key Pages

**Login/Register Page:**
- Simple form
- Email, password for login
- Add name and office address for registration
- Link to switch between login/register

**Dashboard:**
- Welcome message with user name
- Card showing this week's selected restaurant (if available)
- Card showing user's office location
- Quick action buttons:
  - "Set My Preferences"
  - "Vote on Suggestions"
- Google Calendar connection status
- Button to connect calendar if not connected

**Preferences Page:**
- Dropdown for cuisine type
- Radio buttons for price level (visual $ symbols)
- Radio buttons for duration (with emoji icons)
- Save button
- Show if preferences already submitted this week

**Voting Page:**
- Display 2 restaurant cards side-by-side (or stacked on mobile)
- Each card shows:
  - Restaurant name (large, bold)
  - Address, phone
  - Ratings (Google + Yelp)
  - Price level
  - Cuisine type
  - Vote count badge
  - Walking times list (all users)
  - Highlight current user's walking time
  - Vote button (changes to "You voted for this" if already voted)
- Show total votes so far
- Indicate which one user voted for

**Settings/Profile:**
- View/edit office address
- Reconnect Google Calendar
- Change password
- Logout

## Special Requirements

### Office Location
- User inputs office address as text
- System uses Google Maps Geocoding API to convert to coordinates
- Stores both formatted address AND lat/lng
- This is permanent - users work at same office each week

### Walking Time Display
- MUST show walking time for every user in the group
- Current user's time is highlighted or shown differently
- Shows in minutes
- Helps users see if someone has a very long walk

### Majority Rules Logic
**Cuisine Preference:**
- Count votes for each cuisine type
- Pick the one with most votes
- If tied, pick first one alphabetically

**Price Preference:**
- Calculate average of all price levels
- Round to nearest integer (1-4)

**Duration Preference:**
- Count votes for each duration
- Pick most common
- If tied, default to "standard"

### Automatic Selection
- After last user votes, system automatically:
  - Counts votes for each suggestion
  - Marks winner (most votes)
  - If tied, picks first one
  - Stores in selected_restaurants table
  - Shows on dashboard immediately

## Error Handling

### Calendar Issues
- If user hasn't connected calendar, show warning on dashboard
- If can't find common time, notify admin/users
- Gracefully handle expired OAuth tokens (prompt to reconnect)

### Restaurant Search Issues
- If no restaurants match criteria, relax filters
- If still none, notify admin
- Fallback: suggest popular restaurants in SF

### API Rate Limits
- Handle Yelp API rate limits gracefully
- Cache Google Maps results when possible
- Show friendly error messages to users

## Security Requirements
- Hash passwords with bcrypt
- Use JWT tokens for authentication
- Validate all inputs
- Prevent SQL injection with parameterized queries
- Secure OAuth tokens in database
- HTTPS only in production

## Performance Considerations
- Database indexes on:
  - users.email
  - weekly_preferences (user_id, week_start_date)
  - restaurant_suggestions (week_start_date)
  - votes (user_id, week_start_date)
- Cache walking times (don't recalculate for same route)
- Lazy load restaurant suggestions

## Future Enhancements (Not Required Now)
- Push notifications when suggestions are ready
- SMS reminders on lunch day
- Dietary restrictions filter
- Restaurant reservation integration
- Past lunch history
- Group chat

## Success Criteria
- 5 users can register and set office locations
- Users can connect Google Calendars successfully
- Weekly preferences can be submitted
- Automatic suggestion generation works on schedule
- 2 restaurants are suggested with all required details
- Walking times are accurate for all users
- Voting works and winner is auto-selected
- Dashboard displays selected restaurant clearly

## Testing Scenarios
1. Register 5 test users with different SF addresses
2. Each user connects Google Calendar
3. Each user submits different preferences
4. Manually trigger suggestion generation
5. Verify 2 suggestions appear with walking times
6. Each user votes
7. Verify winner is selected automatically
8. Check dashboard shows correct restaurant

## API Keys Needed
User will provide:
- Google Cloud Platform credentials (Calendar, Maps, Places APIs)
- Yelp Fusion API key

## Deployment Target
- Should be deployable to platforms like:
  - Railway + Vercel
  - Heroku
  - Render
  - DigitalOcean

## Technology Preferences
- **Frontend:** React (TypeScript preferred)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Styling:** CSS or Tailwind CSS
- **Authentication:** JWT
- **Scheduling:** node-cron or similar

## Additional Notes
- This is for friends, so UX should be friendly and fun
- Minimize clicks - make it quick to use
- Mobile experience is important (people check on phones)
- Clear visual feedback (loading states, success messages)
- Emphasize the walking times - this is a key feature
- Make voting feel engaging (show live vote counts)

## Summary
Build a web app where 5-9 friends in SF can coordinate weekly lunches automatically. The app checks everyone's Google Calendar, tallies food preferences (majority rules), finds a central meeting point, suggests 2 restaurants with walking times from each person's office, facilitates voting, and picks the winner. The goal is to eliminate the group chat chaos and make lunch coordination take 40 seconds per person per week instead of 20 messages.
