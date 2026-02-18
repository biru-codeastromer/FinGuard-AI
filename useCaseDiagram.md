# Use Case Diagram - FinGuard AI

## Actors
- Customer
- Risk Analyst
- System Admin
- Notification Provider (Email/SMS Gateway)
- External Fraud Intelligence API (optional signal source)

## Core Use Cases
- Register/Login/Refresh Session (JWT)
- Manage Profile and Linked Accounts
- Initiate Transaction
- Validate DTO and Business Rules
- Execute Fraud Detection Pipeline (Rules + AI)
- Compute Risk Score
- Approve/Hold/Block Transaction
- Generate Alerts and Send Notifications
- Monitor Risk Queue
- Review Cases and Apply Manual Override
- Manage Fraud Rules and Thresholds
- View Audit Logs and Compliance Reports

## TypeScript/NestJS Implementation Mapping
- Route handling through NestJS controllers.
- Request and response contracts represented as TypeScript DTO classes.
- Guard-based authentication/authorization (`JwtAuthGuard`, `RolesGuard`).
- Business orchestration in services with interface-based repositories.

## Mermaid Use Case Diagram
```mermaid
flowchart LR
    C[Customer]
    RA[Risk Analyst]
    SA[System Admin]
    NP[Notification Provider]
    EFI[External Fraud Intelligence API]

    subgraph FG[FinGuard AI Platform - NestJS REST Backend]
        UC1((Register or Login))
        UC2((Manage User and Account))
        UC3((Initiate Transaction))
        UC4((DTO Validation and Policy Checks))
        UC5((Fraud Detection Pipeline))
        UC6((Behavioral Analysis))
        UC7((Risk Score Calculation))
        UC8((Decision Approve Hold Block))
        UC9((Create Alert))
        UC10((Dispatch Notification))
        UC11((Risk Queue Monitoring))
        UC12((Review Case and Override))
        UC13((Manage Fraud Rules))
        UC14((View Audit Logs))
        UC15((Generate Compliance Report))
        UC16((Ingest External Risk Signals))
    end

    C --> UC1
    C --> UC2
    C --> UC3

    UC3 --> UC4
    UC4 --> UC5
    UC5 --> UC6
    UC5 --> UC16
    UC6 --> UC7
    UC16 --> UC7
    UC7 --> UC8

    UC8 --> UC9
    UC9 --> UC10
    UC10 --> NP

    RA --> UC11
    RA --> UC12
    RA --> UC14

    SA --> UC11
    SA --> UC13
    SA --> UC14
    SA --> UC15

    EFI --> UC16
```

## Notes
- `Initiate Transaction` includes DTO validation, fraud analysis, and risk scoring.
- `Review Case and Override` is RBAC-restricted and fully audit-logged.
- `Dispatch Notification` runs asynchronously through queue/event consumers.
