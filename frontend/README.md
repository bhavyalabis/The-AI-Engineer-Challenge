# Mindful Coach Frontend

Next.js App Router UI for the FastAPI mental coach backend in `/api`.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes `npm`)
- FastAPI backend running locally (see `/api/README.md`)
- `OPENAI_API_KEY` set in your shell when running the backend

## Install

From the repository root:

```bash
cd frontend
npm install
```

## Run locally

You need **two terminals** — one for the backend, one for the frontend.

### Terminal 1 — FastAPI backend (port 8000)

From the repository root:

```bash
export OPENAI_API_KEY=sk-your-key-here   # Windows PowerShell: $env:OPENAI_API_KEY="sk-..."
uv sync
uv run uvicorn api.index:app --reload
```

### Terminal 2 — Next.js frontend (port 3000)

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend proxies `/api/*` requests to `http://localhost:8000` via `next.config.ts`, so the UI talks to the same endpoints documented in `/api/README.md`:

- `POST /api/chat` — send a message, receive `{ "reply": "..." }`
- `GET /` — backend health check (proxied as `/health` in dev)

## Build for production

```bash
cd frontend
npm run build
npm start
```

## Deploy on Vercel

From the **repository root**:

```bash
npm install -g vercel
vercel
```

Root `vercel.json` routes:

- `/api/*` → Python serverless function (`api/index.py`)
- everything else → Next.js app (`frontend/`)

Set `OPENAI_API_KEY` in your Vercel project environment variables before deploying.

## Project structure

```
frontend/
├── app/              # App Router pages and layout
├── components/       # Chat UI components
├── lib/api.ts        # Backend fetch helpers
└── next.config.ts    # Dev proxy to FastAPI on port 8000
```
