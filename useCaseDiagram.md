# Use Case Diagram - FinGuard AI

## Actors
- Customer
- Risk Analyst
- System Admin
- Notification Provider (Email/SMS Gateway)
- External Fraud Intelligence API (optional external signal source)

## Core Use Cases
- Register/Login/Refresh Session
- Manage Profile and Linked Accounts
- Initiate Transaction
- Run Transaction Validation
- Execute Fraud Detection (Rules + AI)
- Compute Risk Score
- Approve/Block/Review Transaction
- Generate Alerts and Notify Users
- Admin Risk Queue Monitoring
- Manage Rules and Thresholds
- Manual Case Review and Override
- View Audit Logs and Compliance Reports

## Mermaid Use Case Diagram
```mermaid
flowchart LR
    %% Actors
    C[Customer]
    RA[Risk Analyst]
    SA[System Admin]
    NP[Notification Provider]
    EFI[External Fraud Intelligence API]

    %% System boundary
    subgraph FG[FinGuard AI Platform]
        UC1((Register / Login))
        UC2((Manage User & Account))
        UC3((Initiate Transaction))
        UC4((Validate Transaction Request))
        UC5((Fraud Detection Pipeline))
        UC6((Behavioral Analysis))
        UC7((Risk Score Calculation))
        UC8((Decision: Approve / Hold / Block))
        UC9((Create Alert))
        UC10((Send Notification))
        UC11((Risk Queue Monitoring))
        UC12((Review Case & Override))
        UC13((Manage Fraud Rules))
        UC14((View Audit Logs))
        UC15((Generate Compliance Report))
        UC16((Ingest External Risk Signals))
    end

    %% Customer interactions
    C --> UC1
    C --> UC2
    C --> UC3

    %% Transaction processing includes
    UC3 --> UC4
    UC4 --> UC5
    UC5 --> UC6
    UC5 --> UC16
    UC6 --> UC7
    UC16 --> UC7
    UC7 --> UC8

    %% Alerting
    UC8 --> UC9
    UC9 --> UC10
    UC10 --> NP

    %% Analyst/Admin interactions
    RA --> UC11
    RA --> UC12
    RA --> UC14

    SA --> UC11
    SA --> UC13
    SA --> UC14
    SA --> UC15

    %% External signal source
    EFI --> UC16
```

## Notes
- `Initiate Transaction` includes validation, fraud analysis, and risk scoring before decisioning.
- `Review Case & Override` is restricted by RBAC and fully audit-logged.
- `Send Notification` is asynchronous after decision/alert creation.
