# FinGuard AI - Autonomous Financial Risk & Fraud Intelligence Platform

## 1) Problem Statement
Digital payments and online banking are growing rapidly, but fraud patterns evolve faster than traditional static controls. Many systems either block too many legitimate transactions (false positives) or miss sophisticated fraud (false negatives), while users and operations teams lack clear, actionable risk visibility.

## 2) Solution Overview
FinGuard AI is a backend-first, production-grade fintech platform that:
- Ingests and processes transactions in real time.
- Performs rule-based and AI-driven fraud detection.
- Computes dynamic risk scores using behavioral and contextual signals.
- Generates alerts, recommendations, and case management actions.
- Provides admin observability, auditability, and explainable decisions.

## 3) Scope
### In Scope (Milestone + Semester Build)
- User registration/login with MFA-ready auth design.
- Account lifecycle and balance management.
- Transaction initiation, validation, processing, and status tracking.
- Fraud detection engine (rules + ML strategy abstraction).
- Risk scoring engine with explainability metadata.
- Behavioral analysis (velocity, geo anomalies, device fingerprints).
- Alert/notification pipeline (email/SMS/in-app adapters).
- Admin dashboard APIs for monitoring and case handling.
- Immutable audit logs and decision traceability.

### Out of Scope (Future)
- Cross-bank settlement network integration.
- Real-time graph neural network model serving in production.
- Global compliance engine for all jurisdictions.

## 4) Key Features
- Real-time transaction risk assessment (<300ms target for core decision path).
- Hybrid fraud pipeline: deterministic rules + AI strategies.
- Explainable risk scoring (reason codes + confidence bands).
- Role-based access control (Customer, RiskAnalyst, Admin).
- Alert deduplication, prioritization, escalation workflow.
- Complete audit trail for regulatory and forensic review.
- Secure API-first design for web and mobile clients.

## 5) System Architecture Overview
### High-Level Components
- Frontend (25%):
  - Customer Portal (React/Next.js): accounts, transactions, alerts.
  - Admin Dashboard: risk queue, system metrics, manual overrides.
- Backend (75%):
  - API Gateway / BFF
  - Auth & Identity Service
  - User & Account Service
  - Transaction Service
  - Fraud Detection Service
  - Risk Scoring Service
  - Alert & Notification Service
  - Audit & Monitoring Service
  - Rule Engine + AI Inference Adapter
- Data Layer:
  - PostgreSQL (OLTP)
  - Redis (cache + rate limiting + idempotency tokens)
  - Event Bus (Kafka/RabbitMQ for async risk/alert workflows)
  - Object Storage (model artifacts, audit exports)

### Runtime Style
- Clean architecture boundaries with MVC entry points.
- Controller -> Service -> Repository pattern.
- Event-driven side effects for non-blocking notifications and analytics.

## 6) Tech Stack Suggestion
- Frontend: Next.js (TypeScript), Tailwind CSS, Charting library (ECharts/Recharts).
- Backend: Java Spring Boot or Node.js NestJS (TypeScript). Recommended: Spring Boot for strong enterprise/OOP alignment.
- Database: PostgreSQL.
- Cache: Redis.
- Messaging: Kafka (preferred) or RabbitMQ.
- Auth: JWT + refresh token + optional TOTP MFA.
- Observability: OpenTelemetry + Prometheus + Grafana + ELK.
- CI/CD: GitHub Actions, Docker, Kubernetes (future production deployment).

## 7) Backend Architecture Explanation
### Layered + Clean + MVC
- `controllers`: HTTP adapters, request/response DTO mapping, validation trigger.
- `services`: business orchestration, transaction/fraud/risk decisions.
- `repositories`: data access abstraction for domain entities.
- `domain`: entities, value objects, policies, interfaces.
- `infrastructure`: DB, messaging, external providers, logging.

### Example Flow
1. Transaction API receives request in `TransactionController`.
2. Input validated (schema + business invariants).
3. `TransactionService` checks account state and limits.
4. `FraudDetectionService` runs rule engine + behavioral strategy.
5. `RiskScoringService` computes score and decision.
6. Service persists result atomically and publishes events.
7. Alert service consumes events and triggers notifications.
8. Audit service records full trace with correlation ID.

## 8) Scalability Considerations
- Horizontal scaling of stateless API services behind load balancer.
- Partitioned event topics by account/user for ordered processing.
- Read replicas for analytics-heavy admin queries.
- Caching for risk profiles and frequently accessed configuration.
- Idempotency keys to prevent duplicate transaction processing.
- Circuit breaker and retry policies for external integrations.
- Async offloading for non-critical operations (notifications/reporting).

## 9) Security Design
- Authentication: JWT access token + rotating refresh tokens.
- Authorization: RBAC with least-privilege policies.
- Data protection: TLS in transit, AES encryption at rest, secret vault.
- Fraud hardening: device binding, suspicious IP checks, rate limiting.
- API security: request signatures for sensitive endpoints, nonce support.
- Audit compliance: immutable audit logs, tamper-evident hash chain option.
- Validation: strict request schemas, sanitization, anti-replay controls.

## 10) Design Decisions and Justification
- **Hybrid fraud detection**: rules provide deterministic compliance controls; AI improves adaptive detection.
- **Event-driven side effects**: reduces latency on core transaction path while preserving observability.
- **Repository abstraction**: isolates domain from persistence, enabling DB evolution.
- **Strategy-based risk models**: allows swapping/scaling scoring logic without controller/service churn.
- **Clear bounded services**: improves maintainability and team parallel development.

## 11) OOP Usage (Explicit)
- **Encapsulation**:
  - `Account` entity controls balance mutation via methods (`credit()`, `debit()`) with invariants.
  - `RiskProfile` hides score composition details behind domain methods.
- **Abstraction**:
  - Interfaces like `FraudDetector`, `RiskModelStrategy`, `NotificationChannel` define contracts.
  - Services depend on interfaces, not concrete implementations.
- **Inheritance**:
  - `BaseEntity` provides shared fields (`id`, `createdAt`, `updatedAt`).
  - `BaseController` standardizes response/error helpers.
- **Polymorphism**:
  - Different `RiskModelStrategy` implementations (RuleOnly, HybridAI, HighValueTx) selected at runtime.
  - Notification channels (`EmailNotifier`, `SmsNotifier`, `InAppNotifier`) invoked through common interface.

## 12) Design Patterns Used
- **Repository Pattern**: persistence abstraction for `User`, `Account`, `Transaction`, `Alert`.
- **Factory Pattern**: `RiskModelFactory` chooses scoring strategy based on transaction context.
- **Strategy Pattern**: pluggable fraud/risk algorithms.
- **Singleton Pattern**: centralized config manager and rules cache provider.
- **Observer/Event Publisher**: transaction decision events trigger alerting/audit subscribers.

## 13) API Design Overview
### Core REST Endpoints (Sample)
- Auth:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
- User/Account:
  - `GET /api/v1/users/me`
  - `POST /api/v1/accounts`
  - `GET /api/v1/accounts/{accountId}`
- Transactions:
  - `POST /api/v1/transactions`
  - `GET /api/v1/transactions/{transactionId}`
  - `GET /api/v1/accounts/{accountId}/transactions`
- Risk/Fraud:
  - `GET /api/v1/risk/transactions/{transactionId}`
  - `POST /api/v1/rules` (Admin)
- Alerts/Admin:
  - `GET /api/v1/alerts`
  - `PATCH /api/v1/alerts/{alertId}`
  - `GET /api/v1/admin/monitoring/metrics`

### Validation and Error Contract
- Standard response envelope with `correlationId`.
- Error format:
  - `code` (machine-readable)
  - `message` (human-readable)
  - `details` (field-level issues)
- HTTP policy:
  - `400` validation, `401/403` auth/authz, `404` missing resource, `409` conflict, `422` business rule, `500` internal.

## 14) Logging and Monitoring Design
- Structured logs (JSON) with `traceId`, `userId`, `accountId`, `transactionId`.
- Metrics: decision latency, fraud hit rate, false positive trend, queue lag.
- Distributed tracing across controller-service-repository-event boundaries.
- Alerting on SLA breaches, anomaly spikes, and integration failures.

## 15) Recommended Backend Folder Structure
```text
backend/
  src/
    api/
      controllers/
      dto/
      middleware/
      routes/
    application/
      services/
      usecases/
      factories/
      strategies/
    domain/
      entities/
      valueobjects/
      repositories/
      interfaces/
      exceptions/
    infrastructure/
      persistence/
        postgres/
          repositories/
          models/
      messaging/
      cache/
      auth/
      notifications/
      monitoring/
    config/
    shared/
      constants/
      utils/
      logger/
  tests/
    unit/
    integration/
    e2e/
```

### Responsibility Summary
- Controllers: transport + validation initiation.
- Services/UseCases: business workflows and orchestration.
- Repositories: persistence operations.
- Domain: core business rules and invariants.
- Infrastructure: external systems and adapters.

## 16) Recommended Git Commit Strategy
- Branching:
  - `main` (stable), `develop` (integration), `feature/*`, `fix/*`, `chore/*`.
- Commit style (Conventional Commits):
  - `feat(auth): add refresh token rotation`
  - `feat(fraud): implement velocity rule strategy`
  - `fix(tx): handle duplicate idempotency key`
  - `test(risk): add hybrid model decision tests`
- Frequency:
  - Small, logical commits per module/task.
  - Minimum one meaningful commit per work session.
- Pull Request discipline:
  - Include architecture impact, API changes, and test evidence.

## 17) Production Readiness Checklist (Target)
- API contract versioning (`/v1`).
- 80%+ unit coverage in domain/service layers.
- Integration tests for transaction + fraud decision path.
- Secure secrets management and environment isolation.
- Migration scripts and rollback plan.
- Dashboard metrics and runbook for incident response.
