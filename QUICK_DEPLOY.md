# ⚡ Super Quick Deploy (Easiest Way)

## TL;DR - 10 Minutes Total

**Best option for 5 friends who don't share WiFi:**

1. **Railway.app** - Hosts backend + database (free)
2. **Vercel.com** - Hosts frontend (free)

No credit card needed. Both auto-deploy when you push to GitHub.

---

## 📋 What You Need

- [ ] GitHub account
- [ ] Google Cloud Platform API keys
- [ ] Yelp Fusion API key

---

## 🚀 Steps

### 1️⃣ Push to GitHub (2 min)

```bash
cd lunch-picker
git init
git add .
git commit -m "Lunch picker app"

# Go to github.com/new and create "lunch-picker" repo

git remote add origin https://github.com/YOUR_USERNAME/lunch-picker.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backend on Railway (4 min)

1. Go to **[railway.app](https://railway.app)** → Sign up with GitHub
2. Click **"New Project" → "Deploy from GitHub"**
3. Select your `lunch-picker` repo
4. Click **"+ New" → "Database" → "PostgreSQL"**
5. Click your service → **"Settings"**:
   - Root Directory: `server`
   - Start Command: `npm start`
6. Click **"Networking" → "Generate Domain"**
7. Copy your URL (like `lunch-picker-production.up.railway.app`)
8. Click **"Variables"** tab and add:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_REDIRECT_URI=https://YOUR_RAILWAY_URL/auth/google/callback
YELP_API_KEY=your_yelp_key
GOOGLE_MAPS_API_KEY=your_maps_key
JWT_SECRET=paste_random_string
```

Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3️⃣ Setup Database (1 min)

Add this to Railway variables:
```
AUTO_MIGRATE=true
```

Then update [server/src/index.js](server/src/index.js) - add this RIGHT after `const app = express();`:

```javascript
// Auto-create database tables on first startup
const fs = require('fs');
const path = require('path');
if (process.env.AUTO_MIGRATE === 'true') {
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  const db = require('./db');
  db.query(schema).then(() => console.log('✅ Database schema created')).catch(console.error);
}
```

Push changes:
```bash
git add .
git commit -m "Add auto-migrate"
git push
```

Railway will auto-redeploy and create tables!

### 4️⃣ Update Google OAuth (1 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth client
3. Add redirect URI: `https://YOUR_RAILWAY_URL/auth/google/callback`
4. Save

### 5️⃣ Deploy Frontend on Vercel (2 min)

1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub
2. Click **"New Project"**
3. Import `lunch-picker`
4. Settings:
   - Framework: Create React App
   - Root Directory: `client`
5. Add environment variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://YOUR_RAILWAY_URL`
6. Click **"Deploy"**

Done! You get a URL like `lunch-picker.vercel.app`

---

## ✅ Test It

Visit your Vercel URL → Register → It works! 🎉

---

## 📱 Share with Friends

**Send them:**
```
Our lunch picker app is live!
https://lunch-picker.vercel.app

1. Register with your name + SF office address
2. Connect Google Calendar
3. Set your preferences each week
```

---

## 💰 Cost

**$0/month** for up to 9 users

Railway gives $5/month free credit (plenty for this app)
Vercel is 100% free for hobby projects

---

## 🔄 Making Updates

When you change code:

```bash
git add .
git commit -m "Fix something"
git push
```

Railway and Vercel auto-deploy! No manual steps.

---

## 🆘 Issues?

**Backend won't start:**
- Check Railway logs: Click service → "Deployments" → "View Logs"
- Verify `server` is set as root directory

**Frontend can't reach backend:**
- Check `REACT_APP_API_URL` in Vercel settings
- Make sure it's `https://` not `http://`

**Database errors:**
- Check Railway logs
- Make sure AUTO_MIGRATE ran successfully
- DATABASE_URL is auto-set by Railway (don't add it)

**OAuth fails:**
- Verify redirect URI in Google Console matches Railway URL exactly

---

## That's It! 🍽️

Your app is live and your friends can access it from anywhere!

Every Monday at 9 AM, it auto-generates restaurant suggestions.
