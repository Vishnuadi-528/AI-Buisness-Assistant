# AI Business Assistant — Frontend

A professional, consultancy-style React frontend that lets users enter a business name (or idea + investment amount) and receive a complete AI-generated master business report — rendered as a rich, interactive dashboard.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| Server State | TanStack React Query v5 |
| UI State | Zustand (with persist) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP | Axios (with JWT interceptors) |
| Toasts | react-hot-toast |
| Icons | Lucide React |

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx                    # Router + providers
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Tailwind + global styles
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.tsx       # Login + Register form
│   │   ├── dashboard/
│   │   │   ├── BusinessCard.tsx
│   │   │   ├── NewBusinessForm.tsx
│   │   │   └── ClarificationWizard.tsx
│   │   ├── report/
│   │   │   ├── ReportSummaryBanner.tsx
│   │   │   ├── InvestmentAnalysisChart.tsx
│   │   │   ├── EmployeeTable.tsx
│   │   │   ├── SchemeCard.tsx
│   │   │   ├── LoanGuidanceCard.tsx
│   │   │   ├── RiskAccordion.tsx
│   │   │   ├── ProsConsGrid.tsx
│   │   │   ├── ActionChecklist.tsx
│   │   │   └── NextStepsTimeline.tsx
│   │   └── shared/
│   │       ├── Layout.tsx
│   │       ├── Navbar.tsx
│   │       ├── ProtectedRoute.tsx
│   │       ├── Skeleton.tsx
│   │       ├── ExportMenu.tsx
│   │       └── VersionHistoryDropdown.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBusiness.ts
│   │   └── useReport.ts
│   ├── lib/
│   │   ├── axios.ts               # Axios instance + interceptors
│   │   ├── api.ts                 # API service functions
│   │   └── queryClient.ts
│   ├── pages/
│   │   ├── auth/                  # LoginPage, RegisterPage
│   │   ├── dashboard/             # DashboardPage, NewBusinessPage
│   │   ├── report/                # ReportPage, BusinessReportsPage
│   │   └── settings/              # SettingsPage
│   ├── store/
│   │   └── authStore.ts           # Zustand auth store
│   └── types/
│       └── index.ts               # All TypeScript interfaces
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Prerequisites

- **Node.js** >= 18
- **Backend running** on `http://localhost:3000` (see `/backend` folder)

---

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the backend first

The frontend proxies all `/api` requests to `http://localhost:3000`. Make sure the backend is running:

```bash
cd ../backend
npm run dev
```

### 3. Start the frontend

```bash
npm run dev
```

App opens at **http://localhost:5173**

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard — business list | Yes |
| `/new-business` | New Business Report form | Yes |
| `/business/:id` | Report version history | Yes |
| `/reports/:reportId` | Full report view | Yes |
| `/settings` | Profile & settings | Yes |

---

## Report View Sections

The report page renders 9 structured sections from the AI JSON output:

1. **Executive Summary** — viability score, risk rating, overview
2. **Investment Analysis** — sufficiency verdict, donut chart, capital allocation table
3. **Employee Requirements** — roles table with headcount, salary, priority
4. **Government Schemes** — cards with eligibility and how-to-apply
5. **Bank Loan Guidance** — loan types, eligibility factors, documents needed
6. **Risk Analysis** — accordion by category (Operational, Financial, Market, Legal, Tech, Reputational) with L/I severity tags
7. **Pros & Cons** — two-column grid with viability score bar
8. **Action Plan** — interactive checklist with progress tracker, milestones, tools
9. **Next Steps** — numbered timeline for immediate actions

---

## Key Features

- **JWT auth** — access + refresh token rotation, auto-refresh on 401, persisted in localStorage via Zustand
- **Clarification wizard** — if the AI needs more info before generating, a step-by-step Q&A modal collects answers before re-triggering generation
- **Progress messages** — animated rotating messages while AI generates ("Analysing business model…", "Checking investment…", etc.)
- **Export** — PDF and DOCX download via backend endpoint
- **Version history** — dropdown to switch between report versions
- **Skeleton loaders** — smooth loading states for all data-fetched views
- **Print CSS** — `@media print` styles hide nav/buttons for clean report printing
- **Responsive** — mobile-first, optimized for desktop report reading

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static host (Nginx, Vercel, Netlify, etc.).

For Nginx, add a fallback for client-side routing:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Environment / Proxy

The Vite dev server proxies `/api/*` → `http://localhost:3000` (configured in `vite.config.ts`).

For production, either:
- Set your backend URL in an environment variable and update `axios.ts` `baseURL`
- Configure your reverse proxy to route `/api` to the backend

---

## Folder Conventions

- `hooks/` — React Query mutations/queries, one file per domain
- `lib/api.ts` — raw API calls (no React), imported by hooks
- `components/` — pure presentational components, no data fetching
- `pages/` — route-level components, compose components + hooks
- `store/` — Zustand stores (auth state only)
- `types/` — shared TypeScript interfaces mirroring the backend schema
