# FinGuard AI - Autonomous Financial Risk and Fraud Intelligence Platform

## 1) Problem Statement
Digital payment systems face rapidly evolving fraud patterns. Static controls often fail in two ways: they either block legitimate transactions (high false positives) or miss sophisticated fraudulent behavior (high false negatives). Financial systems also need explainable decisions, strong auditability, and secure APIs.

## 2) Solution Overview
FinGuard AI is a backend-first full stack fintech platform that processes transactions in real time, detects suspicious activity using rule-based and AI-assisted methods, computes risk scores, and triggers alerts with clear reason codes.

The design is production-oriented with strong software engineering practices:
- Clean architecture and module boundaries.
- Controller-Service-Repository flow.
- Type-safe DTO and interface contracts.
- Event-driven side effects for alerting and audit workflows.

## 3) Scope
### In Scope
- User management (registration, login, profile, RBAC).
- Account management (create/link/freeze/view account).
- Transaction processing with idempotency and validation.
- Fraud detection engine (rules + ML score input).
- Risk scoring engine with explainability metadata.
- Behavioral analysis (velocity, geolocation, device patterns).
- Alert and notification system.
- Admin monitoring APIs and investigation flow.
- Immutable audit logging.

### Out of Scope (Future)
- Interbank settlement integration.
- Advanced model retraining pipeline in production.
- Multi-region regulatory engine for all jurisdictions.

## 4) Key Features
- Real-time transaction decisioning (approve/hold/block).
- Hybrid risk detection pipeline: deterministic rules + AI signals.
- Explainable risk score with reason codes.
- Role-based access control (Customer, RiskAnalyst, Admin).
- Audit-ready decision trace with correlation ID.
- Asynchronous alert delivery with retry and dead-letter handling.

## 5) System Architecture Overview
### Full Stack Breakdown
- Frontend (basic UI, 25% focus): React + TypeScript dashboard and customer screens.
- Backend (main focus, 75%): Node.js + TypeScript with NestJS REST services.

### Core Backend Services
- Auth and Identity Module
- Users and Accounts Module
- Transactions Module
- Fraud Detection Module
- Risk Scoring Module
- Alerts and Notifications Module
- Admin Monitoring Module
- Audit Logging Module

### Data and Platform Components
- PostgreSQL (primary transactional data store)
- Prisma ORM (type-safe data access)
- Redis (cache, rate limiting, idempotency token store)
- Message broker (Kafka or RabbitMQ for async processing)
- Observability stack (OpenTelemetry + Prometheus + Grafana + centralized logs)

## 6) Technology Stack Requirements (Mandatory Mapping)
- Backend: TypeScript + Node.js
- Framework: NestJS (Express adapter; optional pure Express fallback)
- Database: PostgreSQL
- ORM: Prisma (recommended for generated TypeScript types); TypeORM can be supported via repository adapters
- API: REST API (`/api/v1/*`)
- Authentication: JWT (access + refresh token rotation)
- Frontend: React + TypeScript (basic UI only)

## 7) Backend Architecture Explanation (NestJS + Clean Architecture)
### Architectural Style
- MVC entry point with Clean Architecture boundaries.
- Request flow: `Controller -> Service -> Repository -> Database`.
- Async side effects through domain events/outbox.

### NestJS Layering
- `modules/*`: bounded contexts (auth, transactions, alerts, etc.).
- `controllers`: route handlers and response mapping.
- `dto`: request/response contracts with validation decorators.
- `services`: business orchestration and use cases.
- `repositories`: persistence contracts and Prisma implementations.
- `entities/interfaces`: domain model and abstractions.
- `common`: exception filters, interceptors, guards, pipes, shared types.

### TypeScript Conventions
- DTO classes with `class-validator` and `class-transformer`.
- Interface-first contracts for repositories and strategies.
- Strict compiler settings (`strict`, `noImplicitAny`, `exactOptionalPropertyTypes`).
- Domain enums and discriminated unions for status/decision modeling.

### Example DTO and Interface
```ts
export class CreateTransactionDto {
  accountId!: string;
  amount!: number;
  currency!: 'USD' | 'INR' | 'EUR';
  merchantName?: string;
  idempotencyKey!: string;
}

export interface IRiskModelStrategy {
  score(input: RiskInput): Promise<RiskScoreResult>;
}
```

## 8) Scalability Considerations
- Stateless NestJS instances behind load balancer.
- Horizontal scaling for transaction and risk services.
- Redis-backed idempotency and request throttling.
- DB read replicas for admin analytics queries.
- Broker partitioning by `accountId` for ordered event handling.
- Outbox pattern to guarantee event publishing consistency.
- Circuit breaker and retry policies for external dependencies.

## 9) Security Design
- JWT authentication with rotating refresh tokens.
- RBAC authorization guard (`@Roles()` + custom guard).
- Password hashing with bcrypt/argon2.
- TLS in transit and encrypted storage at rest.
- PII protection with masked logs and encrypted sensitive fields.
- Request validation and sanitization at controller boundary.
- Rate limiting and suspicious-IP/device heuristics.
- Immutable audit logs for compliance and forensic analysis.

## 10) Design Decisions and Justification
- Hybrid rule + AI detection improves recall while preserving explainability.
- NestJS chosen for modular architecture, DI, and maintainable TS backend patterns.
- Prisma chosen for type-safe queries and schema-driven model generation.
- Repository pattern isolates domain logic from ORM implementation.
- Event-driven alerting reduces synchronous latency on transaction APIs.

## 11) OOP Usage (Explicit)
- Encapsulation:
  - `Account` entity exposes controlled methods (`credit`, `debit`, `freeze`) instead of direct balance mutation.
- Abstraction:
  - `IUserRepository`, `ITransactionRepository`, `IRiskModelStrategy`, `INotificationChannel` interfaces decouple behavior from implementations.
- Inheritance:
  - `BaseEntity` reused by domain entities.
  - `BaseController` or shared response helpers for consistent API envelopes.
- Polymorphism:
  - `RuleOnlyStrategy`, `HybridAiStrategy`, and `HighValueTxStrategy` implement the same strategy interface and are selected at runtime.

## 12) Design Patterns Used
- Repository Pattern: persistence abstraction with Prisma-backed implementations.
- Factory Pattern: strategy selection (`RiskModelFactory`) based on context.
- Strategy Pattern: pluggable risk scoring/fraud detection behavior.
- Singleton Pattern: centralized configuration provider and logger instance.
- Observer/Event Pattern: transaction decision events trigger alert/audit handlers.

## 13) API Design Overview (REST)
### Core Endpoints
- Auth
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
- Users and Accounts
  - `GET /api/v1/users/me`
  - `POST /api/v1/accounts`
  - `GET /api/v1/accounts/:accountId`
- Transactions
  - `POST /api/v1/transactions`
  - `GET /api/v1/transactions/:transactionId`
  - `GET /api/v1/accounts/:accountId/transactions`
- Risk and Rules
  - `GET /api/v1/risk/transactions/:transactionId`
  - `POST /api/v1/rules` (Admin only)
- Alerts and Admin
  - `GET /api/v1/alerts`
  - `PATCH /api/v1/alerts/:alertId`
  - `GET /api/v1/admin/monitoring/metrics`

### Validation and Error Contract
- Global validation pipe rejects invalid DTOs.
- Unified error envelope:
  - `code`: machine-readable error code
  - `message`: user-friendly error message
  - `details`: optional field-level validation errors
  - `correlationId`: request tracing identifier
- HTTP status mapping:
  - `400` validation, `401` unauthorized, `403` forbidden, `404` not found, `409` conflict, `422` business rule violation, `500` internal error.

## 14) Logging and Monitoring Design
- Structured JSON logs with `traceId`, `userId`, `accountId`, and `transactionId`.
- Metrics:
  - transaction decision latency
  - fraud flag rate
  - false positive ratio
  - queue lag and retry counts
- Distributed tracing with OpenTelemetry.
- SLA/SLO alerts for high error rate or delayed event consumers.

## 15) Recommended Backend Folder Structure (NestJS + TypeScript)
```text
backend/
  src/
    main.ts
    app.module.ts
    config/
      env.validation.ts
      configuration.ts
    common/
      constants/
      decorators/
      exceptions/
      filters/
      guards/
      interceptors/
      pipes/
      types/
      utils/
    modules/
      auth/
        auth.module.ts
        auth.controller.ts
        auth.service.ts
        dto/
          login.dto.ts
          register.dto.ts
          refresh-token.dto.ts
        interfaces/
          jwt-payload.interface.ts
      users/
        users.module.ts
        users.controller.ts
        users.service.ts
        dto/
        entities/
        repositories/
          user.repository.interface.ts
          prisma-user.repository.ts
      accounts/
        accounts.module.ts
        accounts.controller.ts
        accounts.service.ts
        dto/
        entities/
        repositories/
          account.repository.interface.ts
          prisma-account.repository.ts
      transactions/
        transactions.module.ts
        transactions.controller.ts
        transactions.service.ts
        dto/
          create-transaction.dto.ts
        entities/
        repositories/
          transaction.repository.interface.ts
          prisma-transaction.repository.ts
      fraud/
        fraud.module.ts
        fraud.service.ts
        strategies/
        factories/
        interfaces/
      risk/
        risk.module.ts
        risk.service.ts
      alerts/
        alerts.module.ts
        alerts.controller.ts
        alerts.service.ts
      audit/
        audit.module.ts
        audit.service.ts
    infrastructure/
      prisma/
        prisma.module.ts
        prisma.service.ts
      messaging/
      cache/
      notifications/
      monitoring/
  prisma/
    schema.prisma
    migrations/
  tests/
    unit/
    integration/
    e2e/
```

## 16) Recommended Git Commit Strategy
- Branches:
  - `main` for stable submissions.
  - `feature/*` for scoped functionality.
  - `fix/*` for bug fixes.
- Conventional commit examples:
  - `feat(auth): implement JWT login and refresh`
  - `feat(tx): add transaction idempotency guard`
  - `feat(fraud): add hybrid risk model strategy`
  - `fix(alerts): handle duplicate queue event`
  - `test(risk): add risk scoring service unit tests`
- Practice:
  - Small logical commits per feature slice.
  - Include tests and API contract updates in the same PR when possible.

## 17) Production Readiness Checklist
- Versioned REST API (`/api/v1`).
- DTO validation for all write endpoints.
- RBAC guard coverage for admin/risk analyst routes.
- Migration-based schema changes through Prisma.
- End-to-end tests for transaction decision path.
- Observability dashboards and incident runbook.
