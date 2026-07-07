# Weekly Report Generator Dashboard

A full-stack web application for structured weekly work reports with role-based access, manager analytics dashboard, project management, and an AI-powered chat assistant.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express, express-validator |
| Database | MongoDB with Mongoose |
| Auth | JWT (httpOnly cookies + Bearer token) |
| AI | Ollama (free, open-source, runs locally) |

## Features

- **Authentication** — Register, login, logout with role-based access (Team Member / Manager)
- **Personal Reports** — Fixed-structure weekly reports with create, edit, submit, and history
- **Team Dashboard** — Summary metrics, charts, submission compliance tracking
- **Team Reports** — Filter by member, project, date range, and status
- **Projects** — CRUD for work categories with optional member assignment
- **AI Assistant** — Conversational Q&A about team activity via Ollama (with rule-based fallback)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- **MongoDB Atlas** (recommended, free cloud — no install) **or** [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local install)
- [Ollama](https://ollama.com/) (optional, for AI features)

## Setup Instructions

### 1. Install Dependencies

From the project root:

```powershell
npm run install:all
```

Or install each part separately:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### 2. Configure Environment

```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` — set `MONGODB_URI` and `JWT_SECRET`.

### 3. Database Setup (MongoDB Atlas — recommended)

No Docker or local MongoDB install required. Atlas provides a free M0 cluster.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. **Create a cluster** — choose the free M0 tier (AWS/Google/Azure, any region).
3. **Database Access** → Add New Database User → set username/password (save these).
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for local development.
5. **Database** → Connect → Drivers → copy the connection string.
6. Paste into `backend/.env`, replacing placeholders:

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/weekly-reports?retryWrites=true&w=majority
```

> URL-encode special characters in the password (e.g. `@` → `%40`, `#` → `%23`).

**Alternative — local MongoDB Community Server**

1. Download the [Windows MSI installer](https://www.mongodb.com/try/download/community).
2. Install with **Install MongoDB as a Service** checked (default).
3. Start the service:

```powershell
net start MongoDB
```

4. Use in `.env`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/weekly-reports
```

### 4. Seed Sample Data (optional)

```powershell
cd backend
npm run seed
```

### 5. Run Backend

Open a terminal:

```powershell
cd backend
npm run dev
```

Server starts at `http://localhost:5000`

### 6. Run Frontend

Open a **second** terminal:

```powershell
cd frontend
npm run dev
```

App opens at `http://localhost:5173`

### 7. AI Assistant (Optional)

Install and run Ollama:

```bash
# Install from https://ollama.com
ollama pull llama3.2
ollama serve
```

If Ollama is not running, the AI assistant falls back to rule-based responses.

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@example.com | password123 |
| Team Member | alice@example.com | password123 |
| Team Member | bob@example.com | password123 |
| Team Member | carol@example.com | password123 |
| Team Member | david@example.com | password123 |

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/auth/users` | Manager | List all users |

### Reports
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reports/my` | Auth | Own reports |
| GET | `/api/reports/team` | Manager | Team reports (filterable) |
| POST | `/api/reports` | Auth | Create report |
| PUT | `/api/reports/:id` | Owner | Update report |
| DELETE | `/api/reports/:id` | Owner | Delete draft |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List projects |
| POST | `/api/projects` | Manager | Create project |
| PUT | `/api/projects/:id` | Manager | Update project |
| DELETE | `/api/projects/:id` | Manager | Delete project |
| PUT | `/api/projects/:id/members` | Manager | Assign members |

### Dashboard & AI
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/stats` | Manager | Dashboard analytics |
| POST | `/api/ai/chat` | Manager | AI chat |
| GET | `/api/ai/summary` | Manager | AI team summary |

## Project Structure

```
weekly-report-generator-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── index.js        # Entry point
│   │   └── seed.js         # Sample data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── utils/          # Helpers
│   └── package.json
├── docs/
│   └── ER-DIAGRAM.md       # Database ER diagram
└── README.md
```

## AI Assistant Approach

- **Provider**: Ollama with `llama3.2` (open-source, runs locally, zero cost)
- **Data flow**: Last 4 weeks of submitted reports are injected as context into the system prompt
- **Privacy**: Report data never leaves your machine when using local Ollama
- **Fallback**: Rule-based keyword matching when Ollama is unavailable
- **Capabilities**: Team Q&A, blocker analysis, executive summaries

## License

MIT
