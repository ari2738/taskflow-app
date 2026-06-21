# TaskFlow — Full-Stack Task Management App

A production-quality task manager with **JWT auth**, **AI features** (Google Gemini), **Kanban drag-and-drop**, **dark mode**, and a polished blue SaaS dashboard.

---

## Features

| Feature | Details |
|---|---|
| JWT Auth | Register / Login, token stored in localStorage |
| Task CRUD | Title, description, status, priority, category, due date |
| Stats Dashboard | Total / Pending / In Progress / Completed / Overdue counts |
| Search & Filter | By title/description, status, priority, category |
| AI Suggest | "AI Suggest" button in task form → Gemini auto-fills description + due date |
| AI Chatbot | Floating chatbot that knows your task list |
| Kanban Board | Drag-and-drop cards between Pending / In Progress / Completed columns |
| List View | Paginated card list with badges |
| Dark Mode | Toggle in topbar, persisted to localStorage |
| Toast Notifications | All save/delete actions show toasts (no browser alerts) |
| Empty States | Friendly illustration when no tasks match |
| Priority Field | Low / Medium / High with colour badges |
| Categories | General, College, Personal, Internship, Work, Health, Finance |
| Pagination | 10 tasks per page in list view |

---

## Tech Stack

- **Backend**: Python · Flask · SQLAlchemy · SQLite (PostgreSQL-ready) · Flask-JWT-Extended · Google Generative AI
- **Frontend**: React 18 · Vite · Lucide Icons · react-hot-toast · @hello-pangea/dnd (drag-and-drop)

---

## Setup

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and add your Gemini API key
# Get a free key at https://aistudio.google.com/app/apikey

# Run the server
python run.py
# → Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
# → Runs on http://localhost:5173
```

### 3. Gemini API Key (for AI features)

1. Go to https://aistudio.google.com/app/apikey
2. Create a free API key
3. Add it to `backend/.env`:
   ```
   GEMINI_API_KEY=your-key-here
   ```

The app works fully without the Gemini key — AI features will show a friendly error toast.

---

## Project Structure

```
task-management-app/
├── backend/
│   ├── app.py              # Flask app factory
│   ├── config.py           # Config from .env
│   ├── models.py           # User + Task SQLAlchemy models
│   ├── run.py              # Entry point
│   ├── requirements.txt
│   ├── .env                # Your secrets (never commit)
│   └── routes/
│       ├── auth.py         # POST /api/auth/register|login
│       ├── tasks.py        # CRUD + stats + search/filter/pagination
│       └── ai.py           # POST /api/ai/suggest|chat
└── frontend/
    └── src/
        ├── App.jsx
        ├── ThemeContext.jsx
        ├── main.jsx
        ├── api.js
        ├── pages/
        │   ├── Dashboard.jsx   # Main view with all features
        │   ├── Login.jsx
        │   └── Register.jsx
        └── components/
            ├── TaskCard.jsx    # List-view card
            ├── TaskForm.jsx    # Create/edit modal with AI suggest
            ├── KanbanBoard.jsx # Drag-and-drop board
            └── AIChatbot.jsx   # Floating chatbot
```
