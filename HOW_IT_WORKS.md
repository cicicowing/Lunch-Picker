# How Lunch Picker Works

## The Problem We're Solving

5 friends working in different offices across San Francisco want to meet for lunch once a week, but:
- ❌ Everyone has different schedules
- ❌ We're in different locations
- ❌ We all have different food preferences
- ❌ Deciding takes forever in group chat
- ❌ Someone always forgets to respond

## The Solution: Lunch Picker 🍽️

An automated app that handles all of this for you!

---

## 📅 Weekly Timeline

### **Sunday Night**
**What you do:** Set your preferences for the week
- 🍱 What cuisine? (sushi, Mexican, Italian, etc.)
- 💰 Budget? ($ to $$$$)
- ⏰ How long? (30 min quick / 1 hour / 1.5 hours fancy)

Takes 30 seconds!

### **Monday Morning 9 AM**
**What the app does automatically:**
1. ✅ Checks everyone's Google Calendar
2. ✅ Finds when everyone is free (11 AM - 2 PM)
3. ✅ Tallies up preferences (majority rules)
4. ✅ Calculates the middle point between all offices
5. ✅ Searches Yelp & Google for restaurants
6. ✅ Picks the top 2 matches
7. ✅ Calculates how long it takes each person to walk there

### **Monday-Tuesday**
**What you do:** Vote on your favorite
- 🗳️ See 2 restaurant options
- 👀 View all the details (ratings, walking times, etc.)
- ✅ Click to vote

Takes 10 seconds!

### **After Everyone Votes**
**What the app does:** Automatically picks the winner
- 🏆 Most votes wins
- 📍 Shows final details on Dashboard
- 🎉 Done! You know where you're going

### **Lunch Day**
**What you do:** Show up and enjoy! 🍽️

---

## 🎯 Example Week

### The Group
- **Alice** - 50 Fremont St
- **Bob** - 101 California St
- **Carol** - 555 Market St
- **David** - 1 Embarcadero Center
- **Eve** - 345 California St

### Their Preferences
- **Alice:** Sushi, $$, 1 hour
- **Bob:** Mexican, $, 1 hour
- **Carol:** Sushi, $$$, 1 hour
- **David:** Italian, $$, 1.5 hours
- **Eve:** Sushi, $$, 1 hour

### Majority Rules
- **Cuisine:** Sushi (3 votes) beats Mexican (1) and Italian (1)
- **Price:** Average = $$ (moderate)
- **Duration:** 1 hour (4 votes)

### Calendar Check
Everyone has these time slots free:
- Tuesday 12:00 PM - 1:00 PM ✅
- Thursday 12:30 PM - 1:30 PM ✅

App picks: **Tuesday at 12:00 PM**

### Location Calculation
Central point between all offices: **📍 Market St & Beale St**

### Restaurant Search
App searches Yelp for:
- 🍱 Sushi restaurants
- 💰 Price level: $$
- 📍 Near Market & Beale
- ⭐ Highest rated
- 🕐 Open at noon Tuesday

### Top 2 Suggestions

**Option 1: Sushi Delight**
- 📍 123 Market St
- ⭐ 4.5/5 rating
- 💰 $$
- 📞 (415) 555-1234
- Walking times:
  - Alice: 5 min
  - Bob: 7 min
  - Carol: 3 min
  - David: 6 min
  - Eve: 8 min

**Option 2: Fusion Palace**
- 📍 456 Mission St
- ⭐ 4.3/5 rating
- 💰 $$
- 📞 (415) 555-5678
- Walking times:
  - Alice: 8 min
  - Bob: 6 min
  - Carol: 5 min
  - David: 4 min
  - Eve: 7 min

### Voting Results
- **Sushi Delight:** 3 votes ✅
- **Fusion Palace:** 2 votes

### Winner
🏆 **Sushi Delight** - Tuesday, Dec 17 at 12:00 PM

---

## 🔍 What Makes This Smart?

### 1. **No More Calendar Tetris**
Instead of:
```
Alice: "I'm free 12-1 on Tuesday"
Bob: "I can do 12:30-1:30 Thursday"
Carol: "Tuesday works but not Thursday"
David: "Either day but prefer 1pm"
...10 messages later...
```

The app checks everyone's calendar automatically!

### 2. **Fair to Everyone's Location**
Doesn't pick a place near just one person. Calculates the middle point so no one walks 20 minutes while someone else walks 2 minutes.

### 3. **Majority Rules, Automatically**
If 3 people want sushi and 2 want Mexican, it picks sushi. If everyone wants something different for price, it averages. No debate needed!

### 4. **Shows Walking Times**
You can see exactly how far each person has to walk. If someone has a 15-minute walk, maybe you vote for the other option.

### 5. **One Vote Per Person**
You can change your vote, but only your latest vote counts. No one can vote multiple times.

### 6. **Set It and Forget It**
Set preferences once per week (30 seconds). Vote once (10 seconds). That's it! Everything else is automatic.

---

## 🎨 What You See

### Dashboard
```
Welcome back, Alice! 👋

📍 Your Office
50 Fremont St, San Francisco, CA

🗓️ This Week
Week of Dec 16, 2024

✅ Lunch is set!
Sushi Delight
📅 Tuesday, Dec 17
🕐 12:00 PM

[Set Preferences]  [Vote]
```

### Voting Page
```
🗳️ Vote for This Week's Restaurant
Week of Dec 16, 2024

✅ You've voted! You can change your vote anytime.

┌─────────────────────────────────┐
│ Sushi Delight        [3 votes]  │
├─────────────────────────────────┤
│ 📍 123 Market St                │
│ 📞 (415) 555-1234               │
│ ⭐ 4.5/5                        │
│ 💰 $$                           │
│ 🍱 Sushi                        │
│ 🕐 standard lunch               │
│ 🚶 5 min walk from your office │
│                                 │
│ Walking times for group:        │
│ • Alice: 5 min                  │
│ • Bob: 7 min                    │
│ • Carol: 3 min                  │
│ • David: 6 min                  │
│ • Eve: 8 min                    │
│                                 │
│ [✓ You voted for this]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Fusion Palace        [2 votes]  │
├─────────────────────────────────┤
│ ... (similar details) ...       │
│                                 │
│ [Vote for this restaurant]      │
└─────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Set preferences Sunday night** so Monday morning suggestions are ready
2. **Connect your real Google Calendar** - the app works best with actual events
3. **Vote early** - the sooner everyone votes, the sooner you know where to go
4. **Check walking times** - if yours is long, maybe vote for the other option
5. **Change your vote anytime** before the week starts if you change your mind

---

## 🎉 Bottom Line

**Without Lunch Picker:**
- 20+ group chat messages
- 3 days to decide
- Someone's calendar conflicts
- Location isn't fair to everyone
- Someone forgets to respond

**With Lunch Picker:**
- 40 seconds of your time total
- Decision made by Tuesday morning
- Only suggests times when everyone is free
- Location is central to the group
- Automatic reminders (future feature!)

**Result:** More time eating lunch with friends, less time organizing it! 🍽️

---

## Questions?

**Q: What if I have a meeting pop up after we've picked a restaurant?**
A: Just decline in the app or let the group know. The app is for coordination, not attendance enforcement!

**Q: Can I suggest a specific restaurant?**
A: Not directly, but set preferences that match what you want and hope it comes up!

**Q: What if we're tied on votes?**
A: The app picks the first one (for now). Future version might do a run-off!

**Q: Can I see past lunches?**
A: Not yet, but that's a planned feature!

**Q: What if no restaurants match our preferences?**
A: The app will suggest the closest matches it can find.

---

Ready to never debate lunch plans again? Let's do this! 🚀
