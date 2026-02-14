# FinGuard AI

FinGuard AI is a backend-focused full stack fintech platform for autonomous fraud detection, financial risk scoring, and operational safety intelligence.

## Project Scope
This project is designed for software engineering and system design evaluation with an emphasis on production-grade backend architecture.

Core capabilities:
- User and account management.
- Transaction processing with validation and idempotency.
- Rule-based and AI-assisted fraud detection.
- Risk scoring with explainable reasons.
- Alerting, notification, and audit logging.

## Mandatory Technology Stack
- Backend: TypeScript + Node.js
- Framework: NestJS (Express adapter)
- Database: PostgreSQL
- ORM: Prisma
- API: REST API
- Authentication: JWT (access and refresh tokens)
- Frontend: React + TypeScript (basic UI)

## Existing Architecture Documents
- `idea.md`
- `useCaseDiagram.md`
- `sequenceDiagram.md`
- `classDiagram.md`
- `ErDiagram.md`

## System Architecture Overview
FinGuard AI follows a modular NestJS backend architecture with clear boundaries:
- `Auth Module`: JWT authentication, refresh token rotation, role checks.
- `Users Module`: profile and user lifecycle operations.
- `Accounts Module`: account ownership, status control, and balance invariants.
- `Transactions Module`: validation, idempotent transaction creation, decision workflow.
- `Fraud Module`: rules engine and AI signal adapters.
- `Risk Module`: weighted scoring and decision generation.
- `Alerts Module`: hold/block alert generation and queue management.
- `Audit Module`: immutable compliance-grade activity logging.

Request lifecycle:
`Controller -> DTO Validation -> Service -> Repository -> Prisma -> PostgreSQL`

## Backend Design Principles
- Clean architecture with strict separation of concerns.
- Controller-Service-Repository pattern.
- Interface-driven dependency injection.
- Type-safe DTO contracts and domain enums.
- Event-driven asynchronous side effects for alerting and notifications.

## REST API Overview
Base path: `/api/v1`

Core endpoint groups:
- Authentication:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
- Accounts and users:
  - `GET /users/me`
  - `POST /accounts`
  - `GET /accounts/:accountId`
- Transactions:
  - `POST /transactions`
  - `GET /transactions/:transactionId`
  - `GET /accounts/:accountId/transactions`
- Risk and alerts:
  - `GET /risk/transactions/:transactionId`
  - `GET /alerts`
  - `PATCH /alerts/:alertId`

## Validation and Error Contract
All write endpoints use DTO validation and return a unified error shape:
- `code`: machine-readable error identifier.
- `message`: human-readable summary.
- `details`: optional field-level validation diagnostics.
- `correlationId`: trace key for debugging and audit.

Primary HTTP status mapping:
- `400`: validation failure.
- `401`: authentication failure.
- `403`: authorization failure.
- `404`: resource not found.
- `409`: conflict or duplicate request.
- `422`: business rule rejection.
- `500`: unexpected server error.

## Fraud and Risk Decision Pipeline
Transaction decisioning runs through a hybrid pipeline:
1. Request validation and account eligibility checks.
2. Deterministic fraud rule evaluation.
3. Behavioral feature extraction (velocity, geo, device patterns).
4. AI-assisted anomaly probability scoring.
5. Weighted risk score generation and decisioning (`APPROVE`, `HOLD`, `BLOCK`).
6. Audit trail persistence and asynchronous alert event publishing.

## Security and Compliance Controls
- JWT access tokens with refresh token rotation.
- RBAC for `Customer`, `RiskAnalyst`, and `Admin` roles.
- Strong request validation at controller boundaries.
- Idempotency keys for transaction endpoints.
- Structured audit logs with correlation IDs.
- Masked sensitive fields in logs and exports.

## Observability and Reliability
- Structured JSON logs for traceability.
- Metrics for latency, fraud-hit rates, and queue lag.
- Distributed tracing across service boundaries.
- Retry and circuit-breaker patterns for dependent services.

## Local Development Setup
Prerequisites:
- Node.js 20+
- PostgreSQL 14+
- npm 10+

Example environment variables:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finguard
JWT_ACCESS_SECRET=replace_with_secure_secret
JWT_REFRESH_SECRET=replace_with_secure_secret
PORT=3000
```

Recommended commands:
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

## Quality and Testing
- Unit tests for services, domain logic, and strategy selection.
- Integration tests for repository and database interactions.
- End-to-end tests for auth and transaction decision flow.

Suggested scripts:
```bash
npm run lint
npm run test
npm run test:cov
npm run test:e2e
```

## Status
Milestone-1 architecture and modeling documentation is complete in this repository.
