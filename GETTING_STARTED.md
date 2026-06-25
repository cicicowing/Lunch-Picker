# Getting Started with Lunch Picker

## What You Just Built

Congratulations! You now have a fully functional lunch coordination app with these features:

✅ **User Management**: Registration, login, and profiles  
✅ **Office Location Tracking**: Each person inputs their SF office address once  
✅ **Google Calendar Integration**: Automatically checks everyone's availability  
✅ **Weekly Preferences**: Choose cuisine, price range, and lunch duration  
✅ **Smart Suggestions**: 2 restaurant recommendations based on group preferences  
✅ **Walking Times**: Shows how long it takes each person to walk from their office  
✅ **Voting System**: Everyone votes, majority wins  
✅ **Automatic Selection**: Winning restaurant is automatically chosen  

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd lunch-picker
npm run install-all
```

### 2. Setup Database
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS

# Create and setup the database
cd server
node setup-db.js
```

### 3. Get API Keys

You need 3 sets of API keys:

**Google Cloud Platform** (3 APIs in 1 account):
- 📅 Calendar API - Check availability
- 🗺️ Maps API - Calculate walking times
- 📍 Places API - Get restaurant details

**Yelp Fusion**:
- 🍽️ Restaurant search and ratings

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed API key instructions.

### 4. Configure Environment
```bash
cd server
cp .env.example .env
nano .env  # Add your API keys
```

### 5. Start the App
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

Visit: **http://localhost:3000**

## 📖 Documentation

- **[README.md](README.md)** - Full project overview and features
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and data flow

## 🎯 How to Use

### Week 1 Setup (One Time)
1. **Register** all 5 friends
2. Each person **connects Google Calendar**
3. Set your **office addresses**

### Every Week
1. **Monday morning**: System generates 2 restaurant suggestions
2. **Monday/Tuesday**: Everyone sets preferences and votes
3. **After all votes**: Winner is automatically selected
4. **Enjoy lunch!** 🍽️

## 📱 User Interface

### Dashboard
- See this week's selected restaurant
- Quick links to preferences and voting
- Connection status for Google Calendar

### Preferences Page
Choose your preferences for the week:
- 🍱 Cuisine type (14 options)
- 💰 Price level ($ to $$$$)
- ⏰ Duration (30 min, 1 hr, 1.5 hr)

### Voting Page
View 2 suggestions with:
- Restaurant name, address, phone
- Google/Yelp ratings
- Your walking time
- Everyone's walking times
- Current vote counts

## 🔧 Common Commands

```bash
# Install everything
npm run install-all

# Run backend only
npm run server

# Run frontend only
npm run client

# Reset database
cd server && node setup-db.js --reset

# View database
psql lunch_picker

# Check server health
curl http://localhost:5000/health
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection error | Run `brew services start postgresql` |
| Port 5000 already in use | Change PORT in `server/.env` |
| API key errors | Double-check keys in `.env` file |
| Calendar not syncing | Reconnect in Dashboard |
| No suggestions appearing | Check server logs for errors |

See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting) for more help.

## 📂 Project Structure

```
lunch-picker/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── App.js       # Main app router
│   │   └── index.js     # Entry point
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── db/          # Database schema
│   │   └── index.js     # Server entry point
│   ├── setup-db.js      # Database setup utility
│   └── package.json
├── README.md            # Full documentation
├── SETUP_GUIDE.md       # Detailed setup steps
├── ARCHITECTURE.md      # System design
└── GETTING_STARTED.md   # This file!
```

## 🌟 Key Features Explained

### Automatic Restaurant Selection
Every Monday at 9 AM, the system:
1. Checks everyone's Google Calendar
2. Finds common free lunch time slots
3. Tallies user preferences (majority rules)
4. Calculates the central meeting point between all offices
5. Searches Yelp for restaurants matching preferences
6. Gets detailed info from Google Places
7. Calculates walking time for each person
8. Presents the top 2 options for voting

### Walking Time Calculation
For each restaurant, the app:
- Takes each person's office coordinates
- Uses Google Maps Distance Matrix API
- Gets walking directions and time
- Shows times for everyone in the group
- Helps choose restaurants that work for all

### Majority Rules Voting
- **Cuisine**: Most votes wins (e.g., 3 votes sushi > 2 votes Mexican)
- **Price**: Average of everyone's preference
- **Duration**: Most common choice

### Calendar Integration
- Uses Google Calendar API with OAuth 2.0
- Checks 11 AM - 2 PM for conflicts
- Finds slots when EVERYONE is free
- Respects meeting privacy (doesn't read event details)

## 🚀 Next Steps

### For Testing
1. Create 5 test accounts
2. Use real SF office addresses
3. Set different preferences for each user
4. Manually run suggestion generation:
   ```bash
   cd server
   node -e "require('./src/services/suggestionService').generateWeeklySuggestions()"
   ```
5. Vote and see the winner!

### For Production
1. Deploy backend (Heroku, AWS, DigitalOcean)
2. Deploy frontend (Vercel, Netlify, CloudFlare Pages)
3. Use production PostgreSQL (AWS RDS, Heroku Postgres)
4. Set up domain and HTTPS
5. Configure production OAuth redirect URIs

### Future Enhancements
- 📱 Mobile app (React Native)
- 🔔 Push notifications
- 🍽️ Restaurant reservation integration
- 🌮 Dietary restrictions
- 📊 Lunch history and analytics
- 💬 Group chat integration

## 💡 Tips

- **Set preferences early**: Do it Sunday night for Monday suggestions
- **Check walking times**: Make sure times work for everyone
- **Vote promptly**: The sooner everyone votes, the sooner you know where to go
- **Use real calendars**: The availability checker works best with actual Google Calendar events
- **Update office location**: If you change offices, update it in settings

## 📞 Support

Having issues? Check these in order:
1. Is PostgreSQL running? `brew services list`
2. Are environment variables set? Check `server/.env`
3. Are APIs enabled? Check Google Cloud Console
4. Are there errors in the terminal? Read the logs
5. Check the browser console (F12)

## 🎉 You're Ready!

Your lunch coordination app is ready to use. Start by:
1. ✅ Registering your account
2. ✅ Connecting Google Calendar  
3. ✅ Setting your preferences
4. ✅ Inviting your friends

Happy lunching! 🍽️
