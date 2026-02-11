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

## Status
Milestone-1 architecture and modeling documentation is complete in this repository.
