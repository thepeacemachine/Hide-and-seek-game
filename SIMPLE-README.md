# 🎮 Jet Lag: Nottingham - Simple Edition

Two separate apps: one for Seekers, one for Hiders!

---

## 📱 What You Need

### Upload to GitHub:

**For Seekers:**
- `seeker.html`
- `seeker-app.js`

**For Hiders:**
- `hider.html`
- `hider-app.js`

---

## 🚀 Setup on GitHub Pages

### Option 1: Two Separate Repositories (Recommended)

**For Seeker App:**
1. Create repository: `jet-lag-seeker`
2. Upload `seeker.html` and `seeker-app.js`
3. Enable GitHub Pages (Settings → Pages → main branch)
4. Your URL: `https://yourusername.github.io/jet-lag-seeker/seeker.html`

**For Hider App:**
1. Create repository: `jet-lag-hider`
2. Upload `hider.html` and `hider-app.js`
3. Enable GitHub Pages
4. Your URL: `https://yourusername.github.io/jet-lag-hider/hider.html`

### Option 2: One Repository with Both Apps

1. Create repository: `jet-lag-nottingham`
2. Upload all 4 files:
   - `seeker.html`
   - `seeker-app.js`
   - `hider.html`
   - `hider-app.js`
3. Enable GitHub Pages
4. Seeker URL: `https://yourusername.github.io/jet-lag-nottingham/seeker.html`
5. Hider URL: `https://yourusername.github.io/jet-lag-nottingham/hider.html`

---

## 🎯 How to Play

### Setup:

1. **Seeker** opens seeker.html on their phone
2. **Hider** opens hider.html on their phone
3. Both click "Start" to begin
4. Hider goes to hide (near a pub in Nottingham)

### During Game:

**Seeker:**
1. Tap a question card (Matching, Radar, etc.)
2. Fill in details (e.g., "Are you within 1 mile?")
3. App marks your GPS location on map
4. **Send the question to hider** via WhatsApp/Snap
5. Question is now used up

**Hider:**
1. Receive question via WhatsApp/Snap
2. Answer the question verbally
3. In the app: Tap "Seeker Asked a Question"
4. Select which question type it was
5. **Automatically draws a random card!**
6. Max 6 cards in hand (discard extras)

### Ending:

- When seeker finds hider (line-of-sight)
- Hider taps "I've Been Caught!"
- See final score:
  - Hunt time + Time bonus cards = Total score
  - Longer = Higher score!

---

## 🔍 Seeker App Features

✅ **5 Question Types:**
- 🔵 Matching (3 uses) - "Is your nearest X same as mine?"
- 🟢 Measuring (3 uses) - "Are you closer to X than me?"
- 🟠 Radar (2 uses) - "Are you within X miles?"
- 🟡 Thermometer (2 uses) - "Am I warmer/colder?"
- 🔷 Photo (1 use) - "Send photo of X"

✅ **Map Features:**
- Shows Nottingham streets
- Your blue GPS dot
- Colored markers where you asked each question
- Click markers to see question details

✅ **Question History:**
- See all questions you've asked
- What type, when asked, details

---

## 🎯 Hider App Features

✅ **Card Drawing:**
- Select question type when asked
- Draws random card automatically
- 6 card hand limit

✅ **Card Types:**
- 🚫 **Veto** - Cancel a seeker's question
- ⏰ **Time +5/10/15/20min** - Added to final score
- 📋 **Duplicate** - Copy a card

✅ **Stats Tracking:**
- Questions answered
- Cards in hand (X/6)
- Current score preview

✅ **Timer:**
- Hunt time tracking
- Pause/resume
- Final score calculation

---

## 💬 Communication

**Questions are sent manually via WhatsApp/Snapchat!**

Example conversation:
```
Seeker (via WhatsApp):
"🟠 RADAR: Are you within 1 mile of me?"

Hider (via WhatsApp):
"Yes, I'm within 1 mile"

Hider (in app):
*Taps "Seeker Asked a Question"*
*Selects "🟠 Radar"*
*Draws card: "Time +10min"*
```

---

## 🎮 Example Game Flow

### Start (00:00)
- Seeker at Old Market Square
- Hider hiding near The Bodega pub

### 10 minutes (00:10)
- **Seeker:** Uses Radar (1 mi) → Hider answers YES
- **Hider:** Draws "Veto" card

### 25 minutes (00:25)
- **Seeker:** Uses Matching (Tram stop) → Hider answers NO
- **Hider:** Draws "Time +15min" card

### 40 minutes (00:40)
- **Seeker:** Uses Photo (Red door) → Hider sends photo
- **Hider:** Draws "Time +5min" card
- Seeker recognizes the location!

### 45 minutes (00:45)
- **Seeker:** Finds hider visually!
- **Game Over**

### Final Score:
- Hunt time: 45 minutes
- Time bonuses: +20 minutes (15+5)
- **Total: 65 minutes** 🏆

---

## 📊 Strategy Tips

### For Seekers:
- Start with **Radar** questions (wide search)
- Use **Measuring** to narrow direction
- Save **Photo** for final confirmation
- Check map to avoid asking same area twice
- **Thermometer** works best when close

### For Hiders:
- Collect **Time bonus** cards for higher score
- Use **Veto** on dangerous questions (Photo, close Radar)
- Keep hand at 5-6 cards (discard duplicates)
- **Don't** veto early questions - save for late game
- Move between nearby pubs if getting close

---

## 🐛 Troubleshooting

### Seeker App Issues:

**Map not loading?**
- Check internet connection
- Wait 10 seconds for tiles to load
- Try zooming in/out

**GPS not working?**
- Allow location permissions
- Go outdoors (GPS struggles indoors)
- Wait 30 seconds for GPS lock

**Markers not showing?**
- Make sure you filled in question details
- Check GPS is active before asking

### Hider App Issues:

**Can't draw card?**
- Hand must be under 6 cards
- Discard a card first

**Timer not working?**
- Check you clicked "Start Hiding"
- Try pause/resume

---

## ✨ Features NOT Needed

❌ No multiplayer sync (send questions manually)  
❌ No hider GPS (seekers figure it out from questions)  
❌ No server setup (everything runs in browser)  
❌ No complicated installation (just open HTML file)

This keeps it **super simple!**

---

## 🎊 You're Ready!

1. Upload files to GitHub
2. Enable GitHub Pages
3. Share links with friends
4. Play in Nottingham!

**Seeker link:** `https://yourusername.github.io/repo-name/seeker.html`  
**Hider link:** `https://yourusername.github.io/repo-name/hider.html`

Have fun! 🚌🔍🎯
