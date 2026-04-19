# FinGuard AI

FinGuard AI is a full-stack fintech application for transaction risk analysis, fraud detection, alert investigation, and audit-ready decision tracking.

This repository now includes both the required SESD design documentation and a working implementation:

- `idea.md`
- `useCaseDiagram.md`
- `sequenceDiagram.md`
- `classDiagram.md`
- `ErDiagram.md`
- `backend/` NestJS + Prisma + PostgreSQL backend
- `frontend/` React + TypeScript frontend

## What Is Implemented

### Backend
- JWT-based authentication with register, login, and refresh flows
- RBAC with `CUSTOMER`, `RISK_ANALYST`, and `ADMIN`
- Clean NestJS layering with controllers, services, and repositories
- Transaction processing with idempotency keys
- Strategy-based risk scoring with rule-only and hybrid scoring strategies
- Fraud rules storage and admin rule APIs
- Alert creation and analyst/admin alert resolution flow
- Immutable audit logging for transaction and alert actions
- Dashboard endpoints for customer and operations views

### Frontend
- Premium fintech landing page inspired by the visual rhythm of the provided Groww references, but branded for FinGuard
- Auth workspace for demo login or customer registration
- Live workspace for accounts, transaction submission, alert queue, and risk operations metrics
- API integration using Axios and React Query

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, React Query, Framer Motion
- Backend: NestJS, TypeScript, Prisma, JWT, Passport
- Database: PostgreSQL
- Tooling: npm workspaces, Docker Compose

## Project Structure

```text
FinGuard-AI/
  backend/
    prisma/
    src/
      common/
      infrastructure/
      modules/
  frontend/
    src/
      api/
      components/
      lib/
      pages/
      types/
  docker-compose.yml
  idea.md
  useCaseDiagram.md
  sequenceDiagram.md
  classDiagram.md
  ErDiagram.md
```

## Demo Credentials

- Customer: `demo@finguard.ai` / `Password@123`
- Analyst: `analyst@finguard.ai` / `Password@123`
- Admin seed exists in the database: `admin@finguard.ai` / `Password@123`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start PostgreSQL:

```bash
docker compose up -d postgres
```

4. Push the schema and seed demo data:

```bash
npm --workspace backend run prisma:push
npm run seed
```

5. Start the app:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api/v1`

## Build Verification

The repository build has been verified with:

```bash
npm run build
```

## Free Deployment

Recommended free setup:

- Frontend: Vercel
- Backend API: Render Web Service
- Database: Render Postgres

### Render backend and database

This repository includes a ready-to-use [render.yaml](render.yaml) blueprint for the backend API and a free Postgres database.

What the blueprint already does:

- creates a free `finguard-db` Postgres instance
- creates a free `finguard-api` web service from `backend/`
- runs `prisma db push`
- seeds the demo data automatically on deploy
- generates JWT secrets automatically
- exposes a health endpoint at `/api/v1/health`

The only value you must provide in Render is:

- `FRONTEND_URL` = your Vercel frontend domain

### Vercel frontend

The frontend includes [frontend/vercel.json](frontend/vercel.json) so React Router deep links like `/workspace` work correctly on Vercel.

In Vercel:

1. Import this GitHub repository.
2. Set the Root Directory to `frontend`.
3. Set `VITE_API_URL` to your Render backend URL with `/api/v1` appended.

Example:

```bash
VITE_API_URL=https://your-render-service.onrender.com/api/v1
```

### Deployment order

1. Create the Render Blueprint from `render.yaml`
2. Copy the Render backend URL
3. Create the Vercel project from `frontend/`
4. Put the Render URL into `VITE_API_URL`
5. Copy the Vercel URL
6. Put the Vercel URL into Render `FRONTEND_URL`
7. Redeploy the Render service once

## Notes

- A root `.gitignore` is included to keep `.env` files, `node_modules`, build output, and other local artifacts out of GitHub.
- The backend expects PostgreSQL. If Docker is installed but not running, start Docker Desktop first and then run the compose and Prisma commands above.
