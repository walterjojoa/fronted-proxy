# ProxyAI Gateway — Frontend

React frontend for the **Proxy Pattern** workshop: an AI platform where every prompt goes through a
chain of proxies (rate limiting → quota) before reaching a simulated AI service.

Backend repository: [walterjojoa/backend-Proxy](https://github.com/walterjojoa/backend-Proxy)

## Features

| Requirement | Where |
|---|---|
| Chat-like interface to send prompts | `src/components/ChatPanel.jsx` |
| Quota progress bar (used vs available), refreshed after every request | `src/components/QuotaCard.jsx` |
| Requests-per-minute counter with countdown to the reset | `src/components/RateLimitCard.jsx` |
| Send button disabled with a countdown when the rate limit is reached (HTTP 429 + `Retry-After`) | `src/components/ChatPanel.jsx`, `src/components/Dashboard.jsx` |
| Upgrade modal with simulated payment when the monthly quota is exhausted (HTTP 402) | `src/components/UpgradeModal.jsx` |
| 7-day usage bar chart | `src/components/UsageChart.jsx` |
| Plan badge (FREE / PRO / ENTERPRISE) with different colors | `src/components/PlanBadge.jsx` |
| Token estimator before sending a prompt | `src/components/TokenEstimator.jsx` |

Extra: a live **proxy chain indicator** shows where each request was accepted or stopped
(Client → Rate Limit Proxy → Quota Proxy → AI Service).

## Tech stack

- React 19 + Vite
- Chart.js (react-chartjs-2)
- lucide-react icons
- Plain CSS with design tokens (no UI framework)

## Project structure

```
src/
├── api/client.js        # fetch wrapper, X-User-Id header, ApiError with status and Retry-After
├── hooks/               # useQuota (status + history), useNow (countdown clock)
├── utils/               # token estimation, plans, formatting
├── components/          # UI components
├── App.jsx              # session (username stored in localStorage)
└── styles.css
```

## Run locally

Requires Node.js 18+ and the backend running on `http://localhost:8080`.

```bash
npm install
cp .env.example .env     # adjust VITE_API_URL if needed
npm run dev              # http://localhost:5173
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL of the Spring Boot backend, without trailing slash |

## Deployment (Vercel)

1. Import this repository in Vercel (framework preset: **Vite**).
2. Add the environment variable `VITE_API_URL` with the public URL of the backend.
3. Deploy, then set `CORS_ALLOWED_ORIGINS` in the backend to the Vercel URL.
