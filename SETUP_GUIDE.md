# Quick Setup Guide

## Step-by-Step Setup

### 1. Install PostgreSQL (if not already installed)

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Create the database:**
```bash
createdb lunch_picker
psql lunch_picker -f server/src/db/schema.sql
```

### 2. Get Your API Keys

#### A. Google Cloud Platform
1. Visit: https://console.cloud.google.com/
2. Create a new project called "Lunch Picker"
3. Enable APIs:
   - Go to "APIs & Services" > "Enable APIs and Services"
   - Search and enable:
     - Google Calendar API
     - Google Maps Distance Matrix API
     - Google Maps Geocoding API
     - Google Places API
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add redirect URI: `http://localhost:5000/auth/google/callback`
   - Save the Client ID and Client Secret
5. Create API Key:
   - Click "Create Credentials" > "API Key"
   - Restrict it to Maps/Places/Geocoding APIs
   - Save the API key

#### B. Yelp Fusion API
1. Visit: https://www.yelp.com/developers/v3/manage_app
2. Click "Create New App"
3. Fill in the form (app name, description, etc.)
4. Copy your API Key

### 3. Configure Environment Variables

```bash
cd server
cp .env.example .env
nano .env  # or use your favorite editor
```

Fill in with your actual values:
```env
PORT=5000
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/lunch_picker

GOOGLE_CLIENT_ID=paste_your_google_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

YELP_API_KEY=paste_your_yelp_api_key_here

GOOGLE_MAPS_API_KEY=paste_your_google_maps_api_key_here

JWT_SECRET=create_a_random_long_string_here
```

**Tip for JWT_SECRET:** Generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Start the Application

**Option A: Two terminals**

Terminal 1 (Backend):
```bash
cd lunch-picker/server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd lunch-picker/client
npm start
```

**Option B: Use separate terminal tabs in VS Code**
- Open VS Code terminal
- Click the split terminal icon
- Run backend in one, frontend in the other

### 6. Access the App

Open your browser to: http://localhost:3000

## Testing the App

### Create Test Users

1. Register 5 users (you and 4 friends):
   - Name: Your actual names
   - Email: Real emails (or test emails)
   - Password: Anything secure
   - Office Address: Real SF addresses, e.g.:
     - "50 Fremont St, San Francisco, CA"
     - "101 California St, San Francisco, CA"
     - "555 Market St, San Francisco, CA"
     - "1 Embarcadero Center, San Francisco, CA"
     - "345 California St, San Francisco, CA"

2. For each user:
   - Click "Connect Google Calendar" on dashboard
   - Authorize the app to read your calendar

3. Go to "My Preferences" and set:
   - Cuisine: e.g., Sushi
   - Price: e.g., $$ (Moderate)
   - Duration: e.g., Standard (1 hour)

4. Manually trigger suggestion generation (for testing):
   - In terminal, run this in the server directory:
   ```bash
   node -e "require('./src/services/suggestionService').generateWeeklySuggestions()"
   ```

5. Go to "Vote" page and vote on your favorite restaurant

6. Have all 5 users vote

7. Check the Dashboard - winning restaurant should be displayed!

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running: `brew services list`
- Check your DATABASE_URL in .env
- Verify database exists: `psql -l | grep lunch_picker`

### API Key Errors
- Double-check all API keys are copied correctly
- Make sure APIs are enabled in Google Cloud Console
- Check API key restrictions aren't too strict

### Port Already in Use
- Backend: Change PORT in server/.env
- Frontend: It will prompt to use a different port automatically

### Google Calendar Not Syncing
- Make sure redirect URI matches exactly in Google Console
- Check that Calendar API is enabled
- Try disconnecting and reconnecting calendar

### No Restaurant Suggestions
- Check that users have set preferences
- Make sure suggestion service ran (check server logs)
- Verify Yelp/Google API keys are working

## Development Tips

### Database Reset
```bash
psql lunch_picker
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
psql lunch_picker -f server/src/db/schema.sql
```

### View Database
```bash
psql lunch_picker
\dt                          # list tables
SELECT * FROM users;         # view users
SELECT * FROM restaurant_suggestions;  # view suggestions
\q
```

### Check Logs
- Backend logs appear in the terminal running `npm run dev`
- Frontend logs appear in browser console (F12)

### Test API Endpoints
Use tools like Postman or curl:
```bash
# Health check
curl http://localhost:5000/health

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Next Steps

1. Invite your 4 friends to register
2. Each person connects their Google Calendar
3. Everyone sets preferences by Sunday night
4. Suggestions generate Monday morning at 9 AM
5. Vote during Monday/Tuesday
6. Enjoy lunch together!

## Support

For issues or questions:
- Check the main README.md
- Review the code comments
- Inspect browser console for frontend errors
- Check server terminal for backend errors
