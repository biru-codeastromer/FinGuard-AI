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

## SLO and Alerting Baseline
- Transaction decision API availability: 99.9% monthly.
- p95 transaction decision latency target: under 300 ms for normal load.
- Alert queue processing delay target: under 60 seconds.
- Critical alert delivery success target: 99% within 2 minutes.

## Release and Rollback Checklist
Before release:
1. Validate migrations in staging.
2. Run unit, integration, and e2e test suites.
3. Confirm environment variables and secrets are set.
4. Verify dashboards and alert rules are active.

Rollback triggers:
- Sustained `SEV-1` behavior after deployment.
- Risk scoring inconsistency above accepted threshold.
- Transaction creation failure rate exceeding baseline limits.

Rollback steps:
1. Revert deployment to previous stable image/tag.
2. Disable risky feature flags.
3. Re-run smoke tests on auth and transaction endpoints.
4. Confirm queue consumers and database health.
