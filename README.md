# KIRA — Autonomous AI Voice Communication Agent & Executive Command Center

> **Not just an AI voicemail.** KIRA is an intelligent, multi-persona AI voice screener and executive communication layer that screens incoming calls live, understands caller intent, asks context-relevant follow-up questions, extracts actionable directives, and manages your follow-ups in an Apple iOS 18 + Linear-inspired cyber-glass cockpit.

---

## ⚡ The KIRA Concept

```
                          Incoming Call
                                ↓
                    User Chooses on Mobile / HUD:
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
[ 📞 Answer Personally ]   [ 🚫 Decline ]     [ ✨ Screen with KIRA ]
        │                       │                       │
User takes call directly   Polite rejection   KIRA introduces itself
                                                        ↓
                                              Converses naturally with caller
                                                        ↓
                                              Understands intent & asks follow-ups
                                                        ↓
                                              Detects urgency & in-call tools
                                                        ↓
                                              Extracts structured call summary
                                                        ↓
                                              Generates follow-up task for host
                                                        ↓
                                              User views in Executive Dashboard
```

---

## 🏗️ System Architecture

```
                                  [ Inbound Caller ]
                     (Browser Simulator / Real Cellular Phone via Twilio)
                                          │
                                          │ Audio Stream (WAV / MP3)
                                          ▼
                            [ FastAPI Backend Gateway ]
                       • Configurable CORS via CORS_ORIGINS
                       • Non-sensitive structured logging (kira)
                       • Global exception masking for production
                                          │
           ┌──────────────────────────────┼──────────────────────────────┐
           │                              │                              │
           ▼                              ▼                              ▼
 [ Faster-Whisper STT ]         [ Google Gemini AI ]           [ Edge-TTS Streaming ]
 • "tiny" INT8 CPU quantized     • Multi-model fail-fast:       • Multi-lingual neural voices:
 • Indian English vocab priming    - gemini-3-flash-preview       - en-IN-NeerjaNeural (English)
 • Phonetic slang normalizer       - gemini-3.6-flash             - te-IN-ShrutiNeural (Telugu)
 • <350ms transcription          • 0ms conversational reflexes    - hi-IN-SwaraNeural (Hindi)
                                          │
                                          ▼
                          [ PostgreSQL + SQLAlchemy 2.0 ]
                • Direct cloud DATABASE_URL compatibility (Render, Neon, Supabase)
                • Production pooling (pool_pre_ping=True, pool_recycle=300)
                • 7 Core Entities: users, organizations, callers, calls, 
                  messages, call_summaries, action_items
```

---

## 🌟 Key Features

1. **Live Call Screening & Smartphone Simulator**:
   - Interactive iPhone 16 Pro simulator with Titanium bezel and dynamic island status.
   - 3-Way action controls: **[ Answer Personally ]**, **[ Screen with KIRA ]**, and **[ Decline ]**.
   - Real-time voice wave visualizer, live dialogue stream, and VAD auto-send on 950ms pause.
2. **Multi-Desk Persona Engine**:
   - 🧑‍🎓 **Student Desk**: Academic project tech stacks, professor syncs, coursework deadlines, hackathon teams.
   - 💻 **Freelancer Desk**: Client design briefs, UI/UX sprints, milestone signoffs, budget quotes.
   - 🏬 **Small Business Desk**: Wholesale orders, product catalogs, vendor dispatches, delivery tracking.
   - 💼 **Professional Desk**: Executive recruitment, advisory board invitations, corporate consulting.
3. **Autonomous In-Call Action Dispatcher**:
   - Automatically detects intents during speech (e.g. Swiggy delivery PIN, gate entry instructions).
   - Simulates or triggers WhatsApp/Email confirmations live during the call in <180ms.
4. **Executive Cockpit Tabs**:
   - **Dashboard**: 5-KPI executive grid (Total Calls, Screened Calls, Completed Calls, Urgent Inquiries, Pending Follow-ups).
   - **Calls & Transcripts**: Searchable archive with audio briefings and expandable transcript drawers.
   - **Action Center (Follow-ups)**: Task management with `All`, `Pending`, `Completed`, and `Urgent` status filters.
   - **Ask KIRA**: RAG-powered natural language query console with Edge-TTS audio playback.
   - **Memory & Callers**: Persistent dossiers remembering repeat callers across multiple phone calls.

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (Local or Hosted via Neon/Supabase)

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in your GEMINI_API_KEY and PostgreSQL credentials in .env

# Run automated tests
python test_production.py

# Start backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Default: VITE_API_BASE_URL=http://127.0.0.1:8000

# Start frontend dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://127.0.0.1:5173`

---

## 🌐 Production Deployment

### 1. Database (Neon / Supabase / Render PostgreSQL)
- Create a free PostgreSQL instance on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
- Copy your connection string (`postgresql://user:password@host/dbname`).

### 2. Backend (Render)
- Import your repository on [Render](https://render.com) as a **Web Service**.
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment Variables:
  - `DATABASE_URL`: `postgresql+psycopg2://...`
  - `GEMINI_API_KEY`: Your Google AI Studio API key
  - `ENVIRONMENT`: `production`
  - `CORS_ORIGINS`: `https://your-frontend.vercel.app`

### 3. Frontend (Vercel)
- Import your repository on [Vercel](https://vercel.com).
- Root directory: `frontend`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Environment Variables:
  - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`

---

## 🔬 Core Engineering Innovations

| Problem | Root Cause | KIRA Engineering Solution | Result |
|---|---|---|---|
| **Voice Latency** | 5-beam Whisper search on CPU + Gemini 503 backoff retries | Pinned language greedy search + INT8 quantization + fail-fast client | **Slashed from ~45s down to 1.5s** (46x speedup) |
| **Silent Microphone Pauses** | Simulator recorder waited for manual click | Smart Voice Activity Detection (VAD) auto-send on 950ms silence | Zero dead air; feels like real phone call |
| **Indian English Accents & Slang** | Unconditioned acoustic model misspelled names & regional terms | Acoustic prompt conditioning + phonetic slang normalizer | Recognizes "Keerthana", "Swiggy", "yaar", "hackathon" |
| **Call Wrap-up Loops** | "Thank you" not classified as call wrap-up | Wrap-up priority check before LLM generation + 0ms goodbye reflex | Warm, polite goodbye without repeating questions |
| **Ask KIRA Intelligence** | Dashboard questions need ground truth | RAG architecture querying PostgreSQL records into Gemini | Accurately cites past call details and action items |

---

## 📋 API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | `GET` | Health check verifying process & PostgreSQL connectivity (`SELECT 1`) |
| `/calls/start` | `POST` | Initiates new screening session with caller memory & audio greeting |
| `/calls/{id}` | `GET` | Full transcript drawer, speaker bubbles, and structured AI summary |
| `/calls/{id}/end` | `POST` | Completes call, extracts structured summary, creates follow-up task |
| `/voice/{call_id}` | `POST` | Interactive duplex audio turn with metadata HTTP response headers |
| `/voice/test` | `POST` | Standalone voice test prototype endpoint |
| `/actions` | `GET` | Action Center follow-up tasks with completion status |
| `/actions/{id}/toggle` | `PATCH` | Check off / toggle follow-up task completion |
| `/assistant/ask` | `POST` | Natural language queries about calls (RAG over PostgreSQL) |
| `/assistant/speak` | `POST` | On-demand text-to-speech audio synthesis via Edge-TTS |
| `/telephony/incoming` | `POST` | Twilio cellular phone webhook receiver |

---

## 🛡️ License & Academic Integrity
Developed as an advanced AI engineering project for intelligent communication screening and autonomous task extraction.
