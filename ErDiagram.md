# ER Diagram - FinGuard AI

## Database Schema Overview
This schema supports user/account/transaction lifecycle, fraud and risk decisions, alerts, notifications, and immutable audit logging.

## Key Tables
- `users`: identity, profile, status.
- `roles`, `user_roles`: RBAC model.
- `accounts`: financial account state.
- `transactions`: payment events and outcomes.
- `risk_assessments`: detailed score and decision metadata.
- `fraud_signals`: rule/model signal breakdown.
- `behavior_profiles`: rolling user behavior baseline.
- `alerts`: risk/fraud alert lifecycle.
- `notifications`: channel delivery status.
- `audit_logs`: immutable activity trail.
- `fraud_rules`: configurable rule engine policies.
- `admin_actions`: overrides and rule changes by analysts/admins.

## Constraints and Data Rules
- Unique: `users.email`, `accounts.account_number`, `transactions.idempotency_key`.
- FK constraints enforced with indexed references.
- `transactions.amount > 0` check constraint.
- Enum-like constraints for statuses (`PENDING`, `APPROVED`, `BLOCKED`, etc.).
- `audit_logs` append-only policy.
- Soft delete (`deleted_at`) only for non-financial metadata tables.

## Mermaid ER Diagram
```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string phone
        string status
        datetime created_at
        datetime updated_at
    }

    ROLES {
        uuid id PK
        string name UK
        string description
    }

    USER_ROLES {
        uuid user_id FK
        uuid role_id FK
        datetime assigned_at
    }

    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string account_number UK
        string account_type
        decimal available_balance
        decimal ledger_balance
        string currency
        string status
        datetime created_at
        datetime updated_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid account_id FK
        string transaction_type
        decimal amount
        string currency
        string merchant_name
        string merchant_category
        string source_ip
        string device_fingerprint
        string geo_location
        string status
        string decision
        string idempotency_key UK
        datetime initiated_at
        datetime processed_at
    }

    RISK_ASSESSMENTS {
        uuid id PK
        uuid transaction_id FK
        int risk_score
        string risk_level
        string decision
        float model_confidence
        json reason_codes
        datetime assessed_at
    }

    FRAUD_SIGNALS {
        uuid id PK
        uuid transaction_id FK
        string signal_type
        string signal_key
        float signal_value
        float weight
        boolean triggered
        datetime created_at
    }

    BEHAVIOR_PROFILES {
        uuid id PK
        uuid user_id FK
        int tx_count_24h
        decimal avg_tx_amount_30d
        string common_geo
        string trusted_devices
        datetime last_updated_at
    }

    ALERTS {
        uuid id PK
        uuid transaction_id FK
        uuid assigned_to_user_id FK
        string severity
        string status
        string title
        string description
        datetime created_at
        datetime resolved_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid alert_id FK
        uuid user_id FK
        string channel
        string template_key
        string delivery_status
        datetime sent_at
    }

    AUDIT_LOGS {
        uuid id PK
        string actor_type
        uuid actor_id
        string action
        string entity_type
        uuid entity_id
        string correlation_id
        json metadata
        datetime created_at
    }

    FRAUD_RULES {
        uuid id PK
        string rule_name UK
        string rule_type
        int priority
        json condition_json
        string action
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    ADMIN_ACTIONS {
        uuid id PK
        uuid admin_user_id FK
        uuid alert_id FK
        string action_type
        string action_note
        datetime created_at
    }

    USERS ||--o{ ACCOUNTS : owns
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : maps

    ACCOUNTS ||--o{ TRANSACTIONS : records
    TRANSACTIONS ||--|| RISK_ASSESSMENTS : evaluated_by
    TRANSACTIONS ||--o{ FRAUD_SIGNALS : emits
    TRANSACTIONS ||--o| ALERTS : may_trigger

    USERS ||--|| BEHAVIOR_PROFILES : has

    ALERTS ||--o{ NOTIFICATIONS : dispatches
    USERS ||--o{ NOTIFICATIONS : receives

    USERS ||--o{ ADMIN_ACTIONS : performs
    ALERTS ||--o{ ADMIN_ACTIONS : audited_by

    USERS ||--o{ AUDIT_LOGS : actor_for
```

## Indexing Recommendations
- `transactions(account_id, initiated_at desc)`
- `transactions(status, decision, processed_at desc)`
- `risk_assessments(risk_score desc, assessed_at desc)`
- `alerts(status, severity, created_at desc)`
- `audit_logs(correlation_id)`
- `fraud_signals(transaction_id, triggered)`

## Retention and Compliance
- Audit logs: retain per regulatory policy (e.g., 7 years).
- Transaction and risk data: archival policy with immutable snapshots.
- PII minimization in logs (hash/mask sensitive fields).
