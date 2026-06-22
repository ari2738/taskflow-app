# TaskFlow — AI-Powered Task Management App

A full-stack task management web app with JWT authentication, AI-powered task suggestions, an AI productivity chatbot, and real-time dashboard analytics. Built as part of the Thiranex internship program.

🔗 **Live demo:** https://taskyyyyi.netlify.app/
📦 **Repo:** https://github.com/ari2738/taskflow-app

## Demo



## Features

- 🔐 **Secure authentication** — JWT-based login/register, password hashing
- ✅ **Full task CRUD** — title, description, status, priority, category, due date
- 📊 **Dashboard analytics** — live counts for total, pending, in progress, completed, and overdue tasks
- 🔍 **Search & filter** — find tasks by keyword or status
- ✨ **AI task suggestions** — Gemini AI auto-generates a description and suggested due date from just a task title
- 💬 **AI productivity chatbot** — ask for help prioritizing your day; it reads your current task list for context
- 🎨 **Polished UI** — animated auth carousel, card-based dashboard, smooth transitions

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, Lucide Icons
**Backend:** Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS
**Database:** SQLite (dev) / PostgreSQL (production)
**AI:** Google Gemini API (`gemini-2.5-flash`)
**Deployment:** Render (backend) + Vercel (frontend)

## Project Structure

```
taskflow-app/
├── backend/
│   ├── app.py              # Flask app factory
│   ├── run.py               # Entry point
│   ├── config.py            # Settings (reads .env)
│   ├── models.py            # User and Task database models
│   ├── routes/
│   │   ├── auth.py          # Register / login
│   │   ├── tasks.py         # Task CRUD + stats
│   │   └── ai.py            # Gemini-powered suggestions & chatbot
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js           # Axios instance with JWT auth
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        └── components/
            ├── AuthCarousel.jsx
            ├── TaskForm.jsx
            └── TaskCard.jsx
```

## Getting Started Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # then add your own keys
python run.py
```

Runs at `http://localhost:5000`. Uses SQLite by default — no database setup required.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`.

### Environment Variables

Set these in `backend/.env`:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Random string for Flask session security |
| `JWT_SECRET_KEY` | Random string for signing login tokens |
| `GEMINI_API_KEY` | Free key from [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `DATABASE_URL` | *(optional)* PostgreSQL URL for production; defaults to local SQLite |

Generate secure random keys with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## How It Works

- **Auth:** Passwords are hashed with Werkzeug. Login issues a JWT, stored client-side and sent as a Bearer token on every API request.
- **Task CRUD:** `/api/tasks` (GET, POST) and `/api/tasks/<id>` (PUT, DELETE), all scoped to the logged-in user via the JWT.
- **AI Suggestions:** `/api/ai/suggest` sends the task title to Gemini, which returns a description and a realistic due date.
- **AI Chatbot:** `/api/ai/chat` sends the user's message plus their current task list as context to Gemini for a relevant, helpful reply.
- **Dashboard stats:** `/api/tasks/stats` aggregates task counts by status and flags overdue tasks.

## Deployment

- **Backend** deployed on Render (`gunicorn run:app`), with environment variables set in the Render dashboard.
- **Frontend** deployed on netlify, pointing to the live frontend URL via `src/api.js`.

## Author

**Abirami** — BE CSE Student · Full-Stack Developer
Built for the Thiranex Skill Development & Future Tech internship program.
