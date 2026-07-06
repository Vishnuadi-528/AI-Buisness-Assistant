# AI Business Assistant — Backend

A production-ready Node.js/Express API that takes a business name (or rough idea + investment amount) and returns a **complete AI-generated business master report** powered by Groq (Llama 3.3 70B).

The report covers: executive summary, investment analysis, employee requirements, government schemes, bank loan guidance, risk matrix, pros/cons, a phased action plan, and next steps — all in structured JSON + rendered Markdown, exportable as PDF or DOCX.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Setup](#setup)
5. [Running the Server](#running-the-server)
6. [API Reference](#api-reference)
7. [Report Generation Flow](#report-generation-flow)
8. [Export](#export)
9. [Running Tests](#running-tests)
10. [Environment Variables](#environment-variables)
11. [Rate Limits](#rate-limits)
12. [MongoDB Notes](#mongodb-notes)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB 7 |
| ODM | Mongoose 8 |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Auth | JWT (access + refresh token rotation) |
| Validation | Joi |
| Logging | Pino + pino-pretty |
| API Docs | Swagger UI (OpenAPI 3.0) |
| PDF Export | PDFKit |
| DOCX Export | docx |
| Testing | Jest |

---

## Project Structure

```
backend/
├── docker-compose.yml         # MongoDB + optional Mongo Express GUI
├── src/
│   ├── config/
│   │   ├── db.js              # Mongoose connect/disconnect
│   │   ├── env.js             # Validated env vars (fail-fast)
│   │   ├── logger.js          # Pino logger
│   │   ├── masterPrompt.js    # LLM system prompt (version-controlled here)
│   │   └── swagger.js         # OpenAPI 3.0 spec
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── business.controller.js
│   │   └── report.controller.js
│   ├── db/
│   │   └── seed.js            # Demo data seed script
│   ├── middleware/
│   │   ├── authenticate.js    # Bearer JWT verification
│   │   ├── errorHandler.js    # Global error + 404 handlers
│   │   ├── rateLimiter.js     # General / AI / Auth rate limiters
│   │   ├── requestLogger.js   # Per-request timing log
│   │   └── validate.js        # Joi schema validation factory
│   ├── models/
│   │   ├── Business.js
│   │   ├── RefreshToken.js    # TTL-indexed (auto-expires)
│   │   ├── Report.js          # Embedded sections array
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── business.routes.js
│   │   └── report.routes.js
│   ├── services/
│   │   ├── aiService.js       # Groq API call + JSON parsing
│   │   └── exportService.js   # PDF + DOCX generation
│   ├── utils/
│   │   ├── jwt.js
│   │   └── response.js
│   ├── validators/
│   │   ├── auth.validators.js
│   │   └── business.validators.js
│   ├── app.js
│   └── server.js
├── tests/unit/
│   ├── aiService.test.js
│   ├── jwt.test.js
│   └── response.test.js
├── .env
├── .env.example
├── jest.config.js
└── package.json
```

---

## Prerequisites

- **Node.js** >= 18 — [nodejs.org](https://nodejs.org)
- **MongoDB** — Docker, local install, or Atlas
- **Groq API key** — [console.groq.com/keys](https://console.groq.com/keys) (free, no credit card)

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Start MongoDB

**Docker (recommended)**
```bash
docker-compose up -d
```
Starts MongoDB on `localhost:27017`. To also open Mongo Express GUI at `http://localhost:8081`:
```bash
docker-compose --profile tools up -d
```

**Local MongoDB (Windows)**
```powershell
Start-Service -Name MongoDB
```

**MongoDB Atlas**
Use your Atlas connection string in `.env`.

### 3. Configure environment

```bash
copy .env.example .env
```

Minimum required values in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ai_business_assistant
JWT_ACCESS_SECRET=<long random string>
JWT_REFRESH_SECRET=<another long random string>
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Get a Groq key at **https://console.groq.com/keys**

### 4. (Optional) Seed demo data

```bash
npm run db:seed
```

Creates `demo@example.com` / `Password123!` with a sample business.

---

## Running the Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

- Server: `http://localhost:3000`
- Health: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/api/docs`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account → tokens |
| POST | `/api/auth/login` | Login → tokens |
| POST | `/api/auth/refresh` | Rotate tokens |
| POST | `/api/auth/logout` | Revoke refresh token |

### Business *(requires Bearer token)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/business` | List your businesses |
| POST | `/api/business` | Create business entry |
| GET | `/api/business/:id` | Get single business |
| PUT | `/api/business/:id` | Update business |
| DELETE | `/api/business/:id` | Delete + all reports |
| POST | `/api/business/:id/generate-report` | Generate AI report |
| POST | `/api/business/:id/clarify` | Submit clarifying answers |

### Reports *(requires Bearer token)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/business/:id/reports` | List report versions |
| GET | `/api/reports/:reportId` | Get full report |
| GET | `/api/reports/:reportId/sections/:key` | Get one section |
| PUT | `/api/reports/:reportId/regenerate` | Regenerate report |
| GET | `/api/reports/:reportId/export?format=pdf` | Download PDF |
| GET | `/api/reports/:reportId/export?format=docx` | Download DOCX |

---

## Report Generation Flow

```
POST /api/business           → create business record
POST /api/business/:id/generate-report
  ├── Full inputs → report saved (version 1) → return report
  └── Missing info → return clarifying_questions[]
        ↓
      POST /api/business/:id/clarify  (save answers)
        ↓
      POST /api/business/:id/generate-report  (retry)

PUT /api/reports/:id/regenerate  → new version (v2, v3…)
GET /api/reports/:id/export      → PDF or DOCX download
```

### curl example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"Password123"}'

# Create business
curl -X POST http://localhost:3000/api/business \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Green Leaf Cafe","investmentAmount":500000,"country":"India","location":"Bangalore","industry":"Food & Beverage","stage":"idea"}'

# Generate report
curl -X POST http://localhost:3000/api/business/<id>/generate-report \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"teamSize":"2 co-founders","timeline":"Launch in 6 months"}'
```

---

## Export

```bash
# PDF
curl -OJ "http://localhost:3000/api/reports/<id>/export?format=pdf" \
  -H "Authorization: Bearer <token>"

# DOCX
curl -OJ "http://localhost:3000/api/reports/<id>/export?format=docx" \
  -H "Authorization: Bearer <token>"
```

---

## Running Tests

```bash
npm test                  # All unit tests
npm run test:coverage     # With coverage report
```

Tests cover AI response parsing, JWT utilities, and HTTP response helpers. No DB or API key needed.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | ✅ | — | Access token secret |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token secret |
| `GROQ_API_KEY` | ✅ | — | Groq API key (`gsk_...`) |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `development` / `production` |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model |
| `AI_MAX_TOKENS` | No | `8000` | Max tokens per response |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifetime |
| `RATE_LIMIT_MAX` | No | `100` | General requests per window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (ms) |
| `AI_RATE_LIMIT_MAX` | No | `10` | AI generation requests per hour |
| `AI_RATE_LIMIT_WINDOW_MS` | No | `3600000` | AI rate limit window (ms) |
| `BCRYPT_SALT_ROUNDS` | No | `12` | Password hash cost |
| `LOG_LEVEL` | No | `info` | Pino log level |

---

## Rate Limits

| Endpoint group | Limit | Window |
|---|---|---|
| All `/api/*` | 100 requests | 15 min |
| `/api/auth/login` + `/register` | 20 requests | 15 min |
| `generate-report` + `regenerate` | 10 requests | 1 hour |

Rate limits are skipped in `NODE_ENV=test`.

---

## MongoDB Notes

- No migrations — Mongoose creates collections automatically on first write
- Indexes (unique email, TTL on refresh tokens, compound on reports) are created at startup
- `RefreshToken` records auto-expire via MongoDB TTL index — no cron job needed
- View data in Mongo Express: `docker-compose --profile tools up -d` → `http://localhost:8081`
- Or connect MongoDB Compass to `mongodb://localhost:27017`

---

## Disclaimer

Reports are for informational purposes only. Not financial, legal, or tax advice. Always consult a qualified professional before making business decisions.
