# Class Diagram - FinGuard AI

## Major Classes and Interfaces
- API Layer: controllers and DTO mapping.
- Application Layer: services, factories, strategies.
- Domain Layer: entities, value objects, contracts.
- Infrastructure Layer: repository implementations and provider adapters.

## OOP Relationship Notes
- **Inheritance**: controllers/entities extend base classes.
- **Composition**: services compose repositories and strategy contracts.
- **Aggregation**: `User` aggregates multiple `Account`s.
- **Polymorphism**: strategy interfaces support multiple concrete algorithms.

## Mermaid Class Diagram
```mermaid
classDiagram
    direction LR

    class BaseEntity {
      +UUID id
      +DateTime createdAt
      +DateTime updatedAt
    }

    class User {
      +String email
      +String phone
      +UserStatus status
      +register()
      +lock()
    }

    class Account {
      +String accountNumber
      +Decimal availableBalance
      +AccountStatus status
      +credit(amount)
      +debit(amount)
      +freeze()
    }

    class Transaction {
      +UUID accountId
      +Decimal amount
      +String currency
      +TransactionStatus status
      +RiskDecision decision
      +markApproved()
      +markBlocked()
    }

    class RiskProfile {
      +UUID userId
      +Int riskScore
      +String riskLevel
      +updateScore()
    }

    class Alert {
      +UUID transactionId
      +AlertSeverity severity
      +AlertStatus status
      +assign(analystId)
      +resolve(note)
    }

    class AuditLog {
      +String actorType
      +UUID actorId
      +String action
      +String correlationId
      +persist()
    }

    BaseEntity <|-- User
    BaseEntity <|-- Account
    BaseEntity <|-- Transaction
    BaseEntity <|-- RiskProfile
    BaseEntity <|-- Alert

    class BaseController {
      +ok(data)
      +created(data)
      +handleError(error)
    }

    class TransactionController {
      +createTransaction(dto)
      +getTransaction(id)
    }

    class AuthController {
      +login(dto)
      +refresh(dto)
    }

    BaseController <|-- TransactionController
    BaseController <|-- AuthController

    class TransactionService {
      +createTransaction(command)
      +evaluateAndPersist()
    }

    class FraudDetectionService {
      +runDetection(context)
    }

    class RiskScoringService {
      +calculateRiskScore(signals, context)
    }

    class BehavioralAnalysisService {
      +extractFeatures(context)
    }

    class AlertService {
      +createAlert(decisionEvent)
      +updateAlertStatus()
    }

    class AuthService {
      +authenticate(credentials)
      +authorize(principal, permission)
    }

    class AuditService {
      +record(event)
    }

    class RiskModelFactory {
      +getStrategy(context) RiskModelStrategy
    }

    class RiskModelStrategy {
      <<interface>>
      +score(context, features)
    }

    class RuleOnlyStrategy {
      +score(context, features)
    }

    class HybridAIStrategy {
      +score(context, features)
    }

    class HighValueTxStrategy {
      +score(context, features)
    }

    RiskModelStrategy <|.. RuleOnlyStrategy
    RiskModelStrategy <|.. HybridAIStrategy
    RiskModelStrategy <|.. HighValueTxStrategy

    class NotificationChannel {
      <<interface>>
      +send(message)
    }

    class EmailNotifier {
      +send(message)
    }

    class SmsNotifier {
      +send(message)
    }

    class InAppNotifier {
      +send(message)
    }

    NotificationChannel <|.. EmailNotifier
    NotificationChannel <|.. SmsNotifier
    NotificationChannel <|.. InAppNotifier

    class UserRepository {
      <<interface>>
      +findById(id)
      +findByEmail(email)
      +save(user)
    }

    class AccountRepository {
      <<interface>>
      +findById(id)
      +save(account)
    }

    class TransactionRepository {
      <<interface>>
      +findById(id)
      +save(tx)
    }

    class AlertRepository {
      <<interface>>
      +findById(id)
      +save(alert)
    }

    class PostgresUserRepository
    class PostgresAccountRepository
    class PostgresTransactionRepository
    class PostgresAlertRepository

    UserRepository <|.. PostgresUserRepository
    AccountRepository <|.. PostgresAccountRepository
    TransactionRepository <|.. PostgresTransactionRepository
    AlertRepository <|.. PostgresAlertRepository

    class ConfigManager {
      <<singleton>>
      +getInstance()
      +get(key)
    }

    TransactionController --> TransactionService
    AuthController --> AuthService

    TransactionService --> AccountRepository
    TransactionService --> TransactionRepository
    TransactionService --> FraudDetectionService
    TransactionService --> RiskScoringService
    TransactionService --> AuditService

    FraudDetectionService --> BehavioralAnalysisService
    FraudDetectionService --> RiskModelFactory

    RiskScoringService --> RiskModelStrategy

    AlertService --> AlertRepository
    AlertService --> NotificationChannel
    AlertService --> AuditService

    User "1" o-- "1..*" Account : owns
    Account "1" o-- "0..*" Transaction : records
    Transaction "1" --> "0..1" Alert : triggers
    User "1" --> "1" RiskProfile : has
```
