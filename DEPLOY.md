# Easy Deployment Guide

## 🚀 Deploy in 15 Minutes (No Credit Card Needed)

We'll use **Railway** (backend + database) and **Vercel** (frontend).

---

## Prerequisites

1. GitHub account
2. Your API keys ready (Google Cloud Platform + Yelp)

---

## Step 1: Push to GitHub (3 min)

```bash
cd lunch-picker

# Initialize git
git init
git add .
git commit -m "Initial lunch picker app"
```

Go to [github.com/new](https://github.com/new):
- Repository name: `lunch-picker`
- Public or Private: Your choice
- Click **"Create repository"**

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/lunch-picker.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway (5 min)

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free, no credit card)

### 2.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `lunch-picker`
4. Railway will detect it and start deploying

### 2.3 Add PostgreSQL Database
1. In your project, click **"+ New"**
2. Select **"Database" → "Add PostgreSQL"**
3. Database is automatically connected!

### 2.4 Configure Backend Service
1. Click on your backend service (the one from GitHub)
2. Go to **"Settings"** tab:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
   - **Build Command**: `npm install`
3. Go to **"Networking"** tab:
   - Click **"Generate Domain"**
   - Copy this URL (e.g., `lunch-picker-production.up.railway.app`)

### 2.5 Add Environment Variables
1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these (one by one):

```
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://YOUR_RAILWAY_URL/auth/google/callback
YELP_API_KEY=your_yelp_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
JWT_SECRET=your_random_string_here
```

**Important:** The `DATABASE_URL` is automatically set by Railway!

### 2.6 Setup Database Schema
Railway doesn't have a GUI to run SQL, so we'll do it manually:

1. In Railway, click your **PostgreSQL** service
2. Go to **"Connect"** tab
3. Copy the **"Postgres Connection URL"**
4. On your local machine:

```bash
# Install PostgreSQL client if you don't have it
brew install postgresql

# Connect to Railway database (paste the connection URL)
psql YOUR_RAILWAY_DATABASE_URL

# Once connected, paste the entire schema.sql content
# Or upload the file:
\i server/src/db/schema.sql

# Exit
\q
```

**Or** easier way - add this to your `server/src/index.js` right after the imports:

```javascript
// Auto-create tables on startup (development only)
const db = require('./db');
const fs = require('fs');
const path = require('path');

if (process.env.AUTO_MIGRATE === 'true') {
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  db.query(schema).then(() => console.log('Schema applied')).catch(console.error);
}
```

Then add `AUTO_MIGRATE=true` to Railway variables (remove after first deploy).

---

## Step 3: Update Google OAuth (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth client
3. Under **"Authorized redirect URIs"**, add:
   ```
   https://YOUR_RAILWAY_URL/auth/google/callback
   ```
4. Click **"Save"**

---

## Step 4: Deploy Frontend to Vercel (5 min)

### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)

### 4.2 Deploy Project
1. Click **"Add New" → "Project"**
2. Import your GitHub repo `lunch-picker`
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - Click **"Deploy"**

### 4.3 Add Environment Variable
After deployment:
1. Go to **"Settings" → "Environment Variables"**
2. Add:
   ```
   Name: REACT_APP_API_URL
   Value: https://YOUR_RAILWAY_URL
   ```
3. Click **"Redeploy"** to apply changes

Vercel gives you a URL like: `lunch-picker.vercel.app`

---

## Step 5: Test It! ✅

1. Visit your Vercel URL: `https://lunch-picker.vercel.app`
2. Click **"Register"**
3. Create an account
4. Connect Google Calendar
5. Set preferences
6. It works! 🎉

---

## Share with Friends

**Just send them your Vercel URL:**
```
Hey! Here's our lunch picker app:
https://lunch-picker.vercel.app

Create an account and connect your Google Calendar!
```

---

## Alternative: Easier but Less Control

### Option: Heroku (One Service, Easier)

Heroku can host both frontend and backend together:

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create lunch-picker-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set GOOGLE_CLIENT_ID=your_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
heroku config:set YELP_API_KEY=your_key
heroku config:set GOOGLE_MAPS_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret
heroku config:set GOOGLE_REDIRECT_URI=https://your-app.herokuapp.com/auth/google/callback

# Build React app
cd client
npm run build

# Move build to server/public
mv build ../server/public

# Deploy
cd ..
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open app
heroku open
```

Then update `server/src/index.js` to serve static files:

```javascript
// Add after other middleware
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
```

---

## Costs

**Railway:**
- Free tier: $5 credit/month
- Your app will likely stay under this
- Database included

**Vercel:**
- 100% free for hobby projects
- Unlimited bandwidth
- Automatic HTTPS

**Total: $0/month** for 5-9 users!

---

## Updating Your App

When you make changes:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway and Vercel automatically redeploy! ✨

---

## Troubleshooting

**Backend not starting:**
- Check Railway logs in dashboard
- Make sure `server` is set as root directory
- Verify all environment variables are set

**Frontend not connecting to backend:**
- Check `REACT_APP_API_URL` is set in Vercel
- Make sure Railway domain is correct
- Check browser console for CORS errors

**Database connection failed:**
- Railway auto-sets `DATABASE_URL`, don't override it
- Check PostgreSQL service is running

**Google OAuth not working:**
- Update redirect URI in Google Console
- Must exactly match Railway URL

---

## Need Help?

Check these in order:
1. Railway logs (click service → "Deployments" → "View Logs")
2. Vercel logs (click deployment → "Functions" tab)
3. Browser console (F12)
4. Check environment variables are set correctly

---

## You're Done! 🎉

Your app is now live and accessible from anywhere!

**Your friends can:**
1. Visit the Vercel URL
2. Register accounts
3. Connect Google Calendar
4. Start coordinating lunches!

Every Monday at 9 AM, the app will automatically generate suggestions. 🍽️
