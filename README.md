# 🛡️ Harmony AI

A simple idea: make communities safer without making people uncomfortable.

Harmony AI lets anyone report issues anonymously, understand what’s happening around them, and get help — all powered by AI.

---

## 🌍 Why this exists

In real life:
- People don’t report problems because they’re scared or unsure  
- Many reports get ignored or buried  
- There’s no easy way to know what’s happening around you  

We wanted to fix that — without removing privacy.

---

## 💡 What Harmony AI does

- 🕶️ *Anonymous reporting* — no identity needed  
- 🤖 *AI assistant* — talk naturally, file reports, ask anything  
- 📍 *Nearby safety insights* — see what’s happening around you  
- 🧠 *Smart filtering* — reduces fake or low-quality reports  
- 🗺️ *Live incident map* — visualise risk zones in real-time  

---

## ⚙️ How it works (simple flow)

1. You report an issue (chat or form)  
2. AI understands and structures it  
3. System evaluates credibility + urgency  
4. Reports get stored and mapped  
5. Nearby users see relevant alerts and hotspots  

---

## 🔥 Key features

### 🤖 AI Chat Assistant
Not a scripted bot.

You can:
- Say “there’s a fight near my hostel”
- Ask “what’s happening near me?”
- Check report status  
- Get guidance inside the app  

---

### 📝 Smart Reporting
- Works through chat or form  
- Structured automatically by AI  
- Minimal effort for the user  

---

### 📍 Location-Based Awareness
- Detects your current location  
- Shows nearby incidents  
- Highlights risky areas  

---

### 🗺️ Live Incident Map
- Real Google Maps integration  
- Color-coded markers:
  - 🔴 High risk  
  - 🟡 Medium  
  - 🟢 Low  

---

### 🧠 AI Filtering (before moderators)
- Detects spam / fake reports  
- Assigns confidence scores  
- Reduces unnecessary workload  

---

## 🧱 Tech stack

*Frontend*  
React + Tailwind + Vite  

*Backend*  
Node.js + Express  

*AI*  
Google Gemini API  

*Maps*  
Google Maps JavaScript API  

---

## 🔐 Privacy first

- No personal identity required  
- Reports are anonymous by design  
- Only location + incident data is used  

---

## 🚀 Running locally

```bash
# clone the repo
git clone https://github.com/your-username/harmony-ai.git

# backend
cd backend
npm install
npm run dev

# frontend
cd ../frontend
npm install
npm run dev
