# Operations Runbook

## Objective
This runbook defines baseline operational procedures for running FinGuard AI in a production-like environment.

## Monitoring Signals
Track these primary indicators:
- API request latency (p50, p95, p99).
- Error rate by endpoint and status code.
- Fraud decision distribution (`APPROVE`, `HOLD`, `BLOCK`).
- Queue lag for asynchronous alert delivery.
- Database connection pool health and slow query count.

## Logging Requirements
- Use structured JSON logs.
- Include `correlationId`, `traceId`, `userId`, and `transactionId` when available.
- Mask or omit sensitive data in logs.
- Keep audit logs immutable.

## Incident Severity
- `SEV-1`: major outage or high-risk incorrect transaction decisions.
- `SEV-2`: partial service degradation affecting critical flows.
- `SEV-3`: non-critical functional issues with available workaround.

## Initial Incident Response Flow
1. Detect and validate impact using dashboards and logs.
2. Notify owner and assign incident commander.
3. Contain impact (throttle, fail-safe mode, or feature flag).
4. Mitigate and restore service.
5. Publish root cause analysis and action items.
