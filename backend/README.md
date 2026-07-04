# AI Business Assistant — Backend

A production-ready Node.js/Express API that takes a business name (or rough idea + investment amount) and returns a **complete AI-generated business master report** powered by Anthropic Claude.

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

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB 7 |
| ODM | Mongoose 8 |
| AI | Anthropic Claude (`claude-3-5-sonnet-20241022`) |
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
ai-business-assistant/
├── docker-compose.yml         # MongoDB + optional Mongo Express GUI
├── src/
│   ├── config/
│   │   ├── db.js              # Mongoose connect/disconnect
│   │   ├── env.js             # Validated env vars (fail-fast)
│   │   ├── logger.js          # Pino logger
│   │   ├── masterPrompt.js    # LLM system prompt (version-controlled)
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
│   │   ├── Business.js        # Mongoose Business model
│   │   ├── RefreshToken.js    # TTL-indexed refresh token store
│   │   ├── Report.js          # Report with embedded sections
│   │   └── User.js            # User model (passwordHash hidden)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── business.routes.js
│   │   └── report.routes.js
│   ├── services/
│   │   ├── aiService.js       # Claude API call + response parsing
│   │   └── exportService.js   # PDF (PDFKit) + DOCX generation
│   ├── utils/
│   │   ├── jwt.js             # Sign / verify helpers
│   │   └── response.js        # Consistent JSON response helpers
│   ├── validators/
│   │   ├── auth.validators.js
│   │   └── business.validators.js
│   ├── app.js                 # Express app + route mounting
│   └── server.js              # Entry point — DB connect, listen, shutdown
├── tests/
│   └── unit/
│       ├── aiService.test.js
│       ├── jwt.test.js
│       └── response.test.js
├── .env.example
├── jest.config.js
└── package.json
```

---

## Prerequisites

- **Node.js** >= 18 — [nodejs.org](https://nodejs.org)
- **MongoDB** — one of:
  - Docker (recommended, see below)
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed locally
  - [MongoDB Atlas](https://www.mongodb.com/atlas) free-tier cloud cluster
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)

---

## Setup

### 1. Install dependencies

```bash
cd ai-business-assistant
npm install
```

### 2. Start MongoDB

**Option A — Docker (easiest, recommended)**

```bash
docker-compose up -d
```

This starts MongoDB 7 on `localhost:27017` with a persistent volume.  
To also open the Mongo Express web GUI on `http://localhost:8081`:

```bash
docker-compose --profile tools up -d
```

**Option B — Local MongoDB**

```bash
# Windows (if installed as a service it starts automatically)
# Or start manually:
mongod --dbpath "C:\data\db"
```

**Option C — MongoDB Atlas**

Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), then copy your connection string into `.env`.

---

### 3. Configure environment

```bash
copy .env.example .env
```

Edit `.env` — minimum required values:

```env
MONGODB_URI=mongodb://localhost:27017/ai_business_assistant
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_another_long_random_string
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

For Atlas, use your connection string:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ai_business_assistant
```

---

### 4. (Optional) Seed demo data

```bash
npm run db:seed
```

Creates a demo user (`demo@example.com` / `Password123!`) and a sample Coffee Shop business.

---

## Running the Server

### Development (auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

Server starts on `http://localhost:3000` (configurable via `PORT`).

**Health check:**
```
GET http://localhost:3000/health
```

**Swagger UI:**
```
http://localhost:3000/api/docs
```

---

## API Reference

All endpoints are prefixed `/api`. Full interactive docs at `/api/docs`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account → access + refresh tokens |
| POST | `/api/auth/login` | Login → tokens |
| POST | `/api/auth/refresh` | Rotate tokens using refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |

### Businesses

> All require `Authorization: Bearer <accessToken>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/business` | List your businesses |
| POST | `/api/business` | Create a business entry |
| GET | `/api/business/:id` | Get single business |
| PUT | `/api/business/:id` | Update business details |
| DELETE | `/api/business/:id` | Delete business + all its reports |
| POST | `/api/business/:id/generate-report` | Generate AI master report |
| POST | `/api/business/:id/clarify` | Submit answers to clarifying questions |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/business/:id/reports` | List all report versions |
| GET | `/api/reports/:reportId` | Get full report (JSON + Markdown) |
| GET | `/api/reports/:reportId/sections/:sectionKey` | Get one section |
| PUT | `/api/reports/:reportId/regenerate` | Regenerate with updated inputs |
| GET | `/api/reports/:reportId/export?format=pdf` | Download as PDF |
| GET | `/api/reports/:reportId/export?format=docx` | Download as DOCX |

Available `sectionKey` values:
`investment_analysis` · `employee_requirement` · `government_schemes` · `bank_loan_guidance` · `risks` · `pros_and_cons` · `action_plan`

---

## Report Generation Flow

```
1. POST /api/business
   → Create business with name, investment, country, stage etc.

2. POST /api/business/:id/generate-report
   → AI analyses inputs.

   If critical info is missing:
   ← { reportType: "clarification_needed", clarifyingQuestions: [...] }
   → POST /api/business/:id/clarify  (submit answers)
   → Call generate-report again.

   If all inputs are present:
   ← Full report saved as version 1, returned in response.

3. PUT /api/reports/:reportId/regenerate
   → Creates version 2, 3 … with updated inputs. Old versions preserved.

4. GET /api/reports/:reportId/export?format=pdf
   → Download formatted report file.
```

### Quick curl example

```bash
# 1. Register
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"Password123"}'

# 2. Create business  (use accessToken from step 1)
curl -s -X POST http://localhost:3000/api/business \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Green Leaf Cafe",
    "investmentAmount": 500000,
    "country": "India",
    "location": "Bangalore",
    "industry": "Food & Beverage",
    "stage": "idea"
  }'

# 3. Generate report  (use business id from step 2)
curl -s -X POST http://localhost:3000/api/business/<businessId>/generate-report \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"teamSize":"2 co-founders","timeline":"Launch in 6 months"}'
```

---

## Export

```bash
# PDF
curl -OJ "http://localhost:3000/api/reports/<reportId>/export?format=pdf" \
  -H "Authorization: Bearer <accessToken>"

# DOCX
curl -OJ "http://localhost:3000/api/reports/<reportId>/export?format=docx" \
  -H "Authorization: Bearer <accessToken>"
```

---

## Running Tests

```bash
# All unit tests
npm test

# With coverage
npm run test:coverage
```

Unit tests cover AI response parsing, JWT utilities, and HTTP response helpers. No database or API key required.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | — | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token signing secret |
| `ANTHROPIC_API_KEY` | Yes | — | Claude API key |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `development` / `production` |
| `ANTHROPIC_MODEL` | No | `claude-3-5-sonnet-20241022` | Claude model |
| `AI_MAX_TOKENS` | No | `8000` | Max tokens per AI response |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifetime |
| `RATE_LIMIT_MAX` | No | `100` | General requests per window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | General rate limit window (ms) |
| `AI_RATE_LIMIT_MAX` | No | `10` | AI generation requests per window |
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

Limits are skipped in `NODE_ENV=test`. Headers `RateLimit-*` are included in every response.

---

## MongoDB Notes

- No migrations needed — Mongoose creates collections automatically on first write.
- Indexes are created automatically at startup (unique email, TTL on refresh tokens, compound index on reports).
- `RefreshToken` documents expire automatically via MongoDB's TTL index — no manual cleanup needed.
- To inspect your data visually, run Mongo Express: `docker-compose --profile tools up -d` → `http://localhost:8081`

---

## Disclaimer

Reports generated by this system are for informational and planning purposes only. They do not constitute financial, legal, or tax advice. Always consult a qualified Chartered Accountant, lawyer, or banking advisor before making business decisions based on AI-generated content.
