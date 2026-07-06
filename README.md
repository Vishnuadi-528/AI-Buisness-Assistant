# AI Business Assistant

A full-stack web application that takes a business name (or rough idea + investment amount) and generates a **complete AI-powered master business report** — investment analysis, employee requirements, government scheme eligibility, bank loan guidance, risk matrix, pros/cons, action plan, and next steps.

---

## Project Structure

```
AI PROJECT 1/
├── backend/      # Node.js + Express + MongoDB API
└── frontend/     # React + TypeScript + Tailwind UI
```

---

## Tech Stack

### Backend
| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB 7 + Mongoose 8 |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Auth | JWT — access + refresh token rotation |
| Validation | Joi |
| Logging | Pino + pino-pretty |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Export | PDFKit (PDF) + docx (DOCX) |
| Tests | Jest |

### Frontend
| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| Server State | TanStack React Query v5 |
| UI State | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP | Axios (JWT interceptors + auto-refresh) |
| Toasts | react-hot-toast |
| Icons | Lucide React |

---

## Prerequisites

- **Node.js** >= 18 — [nodejs.org](https://nodejs.org)
- **MongoDB** — running locally or via Docker or Atlas
- **Groq API key** — [console.groq.com/keys](https://console.groq.com/keys) (free tier available)

---

## Quick Start

### Step 1 — Start MongoDB

**Option A — Docker (recommended)**
```bash
cd backend
docker-compose up -d
```

**Option B — Local MongoDB service (Windows)**
```powershell
Start-Service -Name MongoDB
```

**Option C — MongoDB Atlas**
Use your Atlas connection string in `backend/.env`.

---

### Step 2 — Configure the backend

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` and fill in these required values:

```env
MONGODB_URI=mongodb://localhost:27017/ai_business_assistant

JWT_ACCESS_SECRET=<generate a long random string>
JWT_REFRESH_SECRET=<generate another long random string>

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Generate strong JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Get your Groq API key at **https://console.groq.com/keys** — free, no credit card required.

---

### Step 3 — Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on **http://localhost:3000**

- Health check: `http://localhost:3000/health`
- Swagger docs: `http://localhost:3000/api/docs`

---

### Step 4 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:3000` — no CORS config needed.

---

## Environment Variables

### `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | ✅ | — | Access token signing secret |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token signing secret |
| `GROQ_API_KEY` | ✅ | — | Groq API key (`gsk_...`) |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `development` / `production` |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model to use |
| `AI_MAX_TOKENS` | No | `8000` | Max tokens per AI response |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifetime |
| `RATE_LIMIT_MAX` | No | `100` | General API requests per window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window in ms (15 min) |
| `AI_RATE_LIMIT_MAX` | No | `10` | AI generation requests per hour |
| `AI_RATE_LIMIT_WINDOW_MS` | No | `3600000` | AI rate limit window in ms (1 hour) |
| `BCRYPT_SALT_ROUNDS` | No | `12` | Password hash cost |
| `LOG_LEVEL` | No | `info` | Pino log level |

---

## Pages & Routes (Frontend)

| Route | Page | Auth |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Business list + stats | Protected |
| `/new-business` | New report form | Protected |
| `/business/:id` | Report version history | Protected |
| `/reports/:reportId` | Full report view | Protected |
| `/settings` | Profile & manage businesses | Protected |

---

## API Endpoints (Backend)

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Rotate tokens |
| POST | `/api/auth/logout` | Revoke refresh token |

### Business
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/business` | List your businesses |
| POST | `/api/business` | Create a business entry |
| GET | `/api/business/:id` | Get single business |
| PUT | `/api/business/:id` | Update business |
| DELETE | `/api/business/:id` | Delete business + all reports |
| POST | `/api/business/:id/generate-report` | Generate AI master report |
| POST | `/api/business/:id/clarify` | Submit answers to clarifying questions |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/business/:id/reports` | List all report versions |
| GET | `/api/reports/:reportId` | Get full report |
| GET | `/api/reports/:reportId/sections/:key` | Get a single section |
| PUT | `/api/reports/:reportId/regenerate` | Regenerate with new inputs |
| GET | `/api/reports/:reportId/export?format=pdf` | Download as PDF |
| GET | `/api/reports/:reportId/export?format=docx` | Download as DOCX |

---

## Report Sections

The AI generates a structured master report with these 9 sections:

1. **Executive Summary** — viability score, overall verdict
2. **Investment Analysis** — sufficiency check, capital allocation donut chart
3. **Employee Requirements** — roles, headcount, salary ranges, hire priority
4. **Government Schemes** — eligibility, how to apply, official source hints
5. **Bank Loan Guidance** — loan types, eligibility factors, documents needed
6. **Risk Analysis** — categorized accordion (Operational, Financial, Market, Legal, Tech, Reputational) with severity tags
7. **Pros & Cons** — two-column comparison with viability score bar
8. **Action Plan** — interactive checklist with phases, milestones, tools
9. **Next Steps** — numbered timeline of immediate actions

---

## Report Generation Flow

```
1. Fill the New Business Report form
   → Business name, investment, industry, country, stage

2. Backend creates a Business record in MongoDB

3. Backend calls Groq API with the Master System Prompt

4. Two possible outcomes:
   a. Full report → displayed immediately, saved to DB as version 1
   b. Clarification needed → wizard asks follow-up questions,
      answers are saved, then report generates again

5. Each regeneration creates a new version (v2, v3…)
   Old versions are never deleted — use the version dropdown to switch

6. Export as PDF or DOCX via the Export button on the report page
```

---

## Useful Commands

### Backend
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start without auto-reload
npm run db:seed      # Seed demo user + business
npm test             # Run unit tests
npm run test:coverage  # Tests with coverage report
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

---

## MongoDB Compass

To view your database visually:

1. Open **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. Select the `ai_business_assistant` database
4. Collections: `users`, `businesses`, `reports`, `refreshtokens`

Collections are created automatically on first use — no migrations needed.

---

## Production Build

```bash
# Build frontend
cd frontend
npm run build
# Serve dist/ with Nginx, Vercel, Netlify etc.

# Run backend in production
cd backend
NODE_ENV=production npm start
```

For Nginx client-side routing support:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Disclaimer

Reports generated by this system are for **informational purposes only**. They do not constitute financial, legal, or tax advice. Always consult a qualified Chartered Accountant, lawyer, or banking advisor before making business decisions.
