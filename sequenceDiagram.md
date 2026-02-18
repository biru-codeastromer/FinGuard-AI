# Sequence Diagrams - FinGuard AI

## 1) End-to-End Transaction + Fraud + Risk + Alert Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant FE as Frontend App
    participant API as API Gateway
    participant Auth as AuthService
    participant TxC as TransactionController
    participant TxS as TransactionService
    participant Acct as AccountService
    participant Fraud as FraudDetectionService
    participant Behav as BehavioralAnalysisService
    participant Rule as RuleEngine
    participant AI as RiskModelAdapter
    participant Risk as RiskScoringService
    participant TxR as TransactionRepository
    participant Outbox as EventOutbox
    participant Alert as AlertService
    participant Notify as NotificationService
    participant Audit as AuditLogService

    User->>FE: Submit transaction request
    FE->>API: POST /api/v1/transactions (JWT, idempotency-key)
    API->>Auth: Validate JWT and roles

    alt Authentication failed
        Auth-->>API: invalid token / expired
        API-->>FE: 401 Unauthorized + error code + correlationId
        FE-->>User: Prompt re-login
    else Authentication success
        Auth-->>API: principal context
        API->>TxC: forward validated request
        TxC->>TxC: Validate schema + basic constraints

        alt Validation error
            TxC-->>API: 400 ValidationError(details)
            API-->>FE: 400 + field errors + correlationId
        else Validation success
            TxC->>TxS: createTransaction(command)
            TxS->>Acct: verify account status, balance, velocity limits

            alt Business rule violation
                Acct-->>TxS: insufficient funds / account frozen
                TxS->>Audit: record rejected decision
                TxS-->>TxC: 422 BusinessRuleViolation
                TxC-->>API: 422 + reason code
                API-->>FE: show actionable failure message
            else Account checks pass
                TxS->>Fraud: runDetection(transactionContext)
                Fraud->>Rule: evaluate deterministic rules
                Fraud->>Behav: compute behavior features
                Behav-->>Fraud: feature vector
                Fraud->>AI: infer anomaly probability
                AI-->>Fraud: model score + confidence
                Fraud-->>TxS: fraud signals + reason codes

                TxS->>Risk: calculateRiskScore(signals, context)
                Risk-->>TxS: riskScore + decision(Approve/Hold/Block)

                TxS->>TxR: persist transaction + risk snapshot
                TxR-->>TxS: persisted(transactionId)
                TxS->>Outbox: publish TransactionDecided event
                TxS->>Audit: write decision trail + factors
                TxS-->>TxC: success payload
                TxC-->>API: 201 Created
                API-->>FE: transaction status + risk metadata
                FE-->>User: display status

                par Async alerting
                    Outbox->>Alert: consume TransactionDecided
                    alt decision is Hold or Block
                        Alert->>Notify: dispatch notification templates
                        Notify-->>Alert: delivery status
                    else decision is Approve
                        Alert-->>Alert: no critical alert (optional info alert)
                    end
                    Alert->>Audit: record alert lifecycle
                end
            end
        end
    end
```

## 2) Authentication and Authorization Flow
```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Frontend
    participant API as API Gateway
    participant Auth as AuthController
    participant IdP as IdentityService
    participant Token as TokenService
    participant Sess as SessionRepository

    U->>FE: Login(email, password, otp?)
    FE->>API: POST /api/v1/auth/login
    API->>Auth: forward credentials
    Auth->>IdP: verify credentials + MFA policy

    alt invalid credentials
        IdP-->>Auth: authentication failed
        Auth-->>API: 401 AUTH_INVALID_CREDENTIALS
        API-->>FE: login failed
    else valid credentials
        IdP-->>Auth: authenticated user + roles
        Auth->>Token: issue access + refresh tokens
        Token->>Sess: store refresh token fingerprint
        Sess-->>Token: stored
        Token-->>Auth: token pair
        Auth-->>API: 200 auth payload
        API-->>FE: tokens + expiry
    end
```

## 3) Error Handling and Recovery Flow (Service Failure)
```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as Frontend
    participant API as API Gateway
    participant TxS as TransactionService
    participant Fraud as FraudDetectionService
    participant CB as CircuitBreaker
    participant Audit as AuditLogService

    U->>FE: Submit transaction
    FE->>API: POST /transactions
    API->>TxS: createTransaction
    TxS->>Fraud: runDetection

    alt Fraud service timeout
        Fraud--xTxS: timeout exception
        TxS->>CB: register failure
        CB-->>TxS: OPEN (fallback mode)
        TxS->>Audit: log dependency failure + degraded decision path
        TxS-->>API: 503 SERVICE_UNAVAILABLE (retryable=true)
        API-->>FE: 503 + retry-after + correlationId
        FE-->>U: please retry shortly
    else Fraud service recovered
        Fraud-->>TxS: signals
        TxS-->>API: normal response
        API-->>FE: success
    end
```
