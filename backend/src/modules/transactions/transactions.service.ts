import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ROLES } from '../../common/constants/roles';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AccountsRepository } from '../accounts/repositories/accounts.repository';
import { AlertsService } from '../alerts/alerts.service';
import { AuditService } from '../audit/audit.service';
import { RiskService } from '../risk/risk.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsRepository } from './repositories/transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsRepository: AccountsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly riskService: RiskService,
    private readonly alertsService: AlertsService,
    private readonly auditService: AuditService,
  ) {}

  async createTransaction(dto: CreateTransactionDto, user: CurrentUser) {
    const existing = await this.transactionsRepository.findByIdempotencyKey(
      dto.idempotencyKey,
    );

    if (existing) {
      return this.serializeTransaction(existing);
    }

    const account = await this.accountsRepository.findByIdDetailed(dto.accountId);
    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    this.assertAccess(account.userId, user.roles, user.sub);

    if (account.status === 'FROZEN') {
      throw new UnprocessableEntityException('Account is frozen.');
    }

    const availableBalance = Number(account.availableBalance);
    if (dto.transactionType === 'DEBIT' && availableBalance < dto.amount) {
      throw new UnprocessableEntityException('Insufficient funds for this transaction.');
    }

    const assessment = await this.riskService.assess({
      amount: dto.amount,
      merchantCategory: dto.merchantCategory,
      geoLocation: dto.geoLocation,
      deviceFingerprint: dto.deviceFingerprint,
      behavior: {
        txCount24h: account.user.behaviorProfile?.txCount24h ?? 0,
        avgTxAmount30d: Number(account.user.behaviorProfile?.avgTxAmount30d ?? 0),
        commonGeo: account.user.behaviorProfile?.commonGeo,
        trustedDevices:
          (account.user.behaviorProfile?.trustedDevices as string[] | null) ?? [],
      },
    });

    const correlationId = `corr-${randomUUID()}`;

    const transaction = await this.prisma.$transaction(async (tx) => {
      const createdTransaction = await this.transactionsRepository.createTransaction(
        {
          accountId: dto.accountId,
          transactionType: dto.transactionType,
          amount: new Prisma.Decimal(dto.amount),
          currency: dto.currency,
          merchantName: dto.merchantName,
          merchantCategory: dto.merchantCategory,
          sourceIp: dto.sourceIp,
          deviceFingerprint: dto.deviceFingerprint,
          geoLocation: dto.geoLocation,
          status: this.toStatus(assessment.decision),
          decision: assessment.decision,
          idempotencyKey: dto.idempotencyKey,
          correlationId,
          processedAt: new Date(),
        },
        tx,
      );

      await this.transactionsRepository.createRiskAssessment(
        {
          transactionId: createdTransaction.id,
          riskScore: assessment.riskScore,
          riskLevel: assessment.riskLevel,
          decision: assessment.decision,
          modelConfidence: assessment.modelConfidence,
          reasonCodes: assessment.reasonCodes,
        },
        tx,
      );

      await this.transactionsRepository.createFraudSignals(
        assessment.signals.map((signal) => ({
          transactionId: createdTransaction.id,
          signalType: signal.signalType,
          signalKey: signal.signalKey,
          signalValue: signal.signalValue,
          weight: signal.weight,
          triggered: signal.triggered,
        })),
        tx,
      );

      if (assessment.decision === 'APPROVE') {
        const delta = dto.transactionType === 'DEBIT' ? -dto.amount : dto.amount;
        await this.accountsRepository.updateBalances(
          dto.accountId,
          {
            availableBalance: availableBalance + delta,
            ledgerBalance: Number(account.ledgerBalance) + delta,
          },
          tx,
        );
      }

      await tx.behaviorProfile.upsert({
        where: { userId: account.userId },
        update: {
          txCount24h: (account.user.behaviorProfile?.txCount24h ?? 0) + 1,
          avgTxAmount30d: new Prisma.Decimal(
            this.nextAverage(
              Number(account.user.behaviorProfile?.avgTxAmount30d ?? 0),
              dto.amount,
            ),
          ),
          commonGeo:
            account.user.behaviorProfile?.commonGeo ??
            dto.geoLocation ??
            account.user.behaviorProfile?.commonGeo,
          trustedDevices: this.nextTrustedDevices(
            (account.user.behaviorProfile?.trustedDevices as string[] | null) ?? [],
            dto.deviceFingerprint,
            assessment.decision,
          ),
        },
        create: {
          userId: account.userId,
          txCount24h: 1,
          avgTxAmount30d: new Prisma.Decimal(dto.amount),
          commonGeo: dto.geoLocation,
          trustedDevices: dto.deviceFingerprint ? [dto.deviceFingerprint] : [],
        },
      });

      await this.alertsService.handleDecision(
        {
          transactionId: createdTransaction.id,
          customerUserId: account.userId,
          riskScore: assessment.riskScore,
          decision: assessment.decision,
          reasonCodes: assessment.reasonCodes,
          correlationId,
          merchantName: dto.merchantName,
        },
        tx,
      );

      await this.auditService.log(
        {
          actorType: user.roles.includes(ROLES.ADMIN) ? 'ADMIN' : 'USER',
          actorId: user.sub,
          action: `TRANSACTION_${assessment.decision}`,
          entityType: 'TRANSACTION',
          entityId: createdTransaction.id,
          correlationId,
          metadata: {
            amount: dto.amount,
            currency: dto.currency,
            merchantName: dto.merchantName,
            riskScore: assessment.riskScore,
            strategy: assessment.strategy,
          },
        },
        tx,
      );

      return this.transactionsRepository.findById(createdTransaction.id, tx);
    });

    if (!transaction) {
      throw new NotFoundException('Transaction could not be loaded after creation.');
    }

    return this.serializeTransaction(transaction);
  }

  async getTransaction(transactionId: string, user: CurrentUser) {
    const transaction = await this.transactionsRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    this.assertAccess(transaction.account.userId, user.roles, user.sub);
    return this.serializeTransaction(transaction);
  }

  async listForAccount(accountId: string, user: CurrentUser) {
    const account = await this.accountsRepository.findByIdDetailed(accountId);
    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    this.assertAccess(account.userId, user.roles, user.sub);

    const transactions = await this.transactionsRepository.findByAccountId(accountId);
    return transactions.map((transaction) => this.serializeTransaction(transaction));
  }

  private serializeTransaction(transaction: {
    id: string;
    amount: Prisma.Decimal;
    currency: string;
    transactionType: string;
    status: string;
    decision: string | null;
    merchantName: string | null;
    merchantCategory: string | null;
    idempotencyKey: string;
    correlationId: string;
    initiatedAt: Date;
    processedAt: Date | null;
    riskAssessment?: {
      riskScore: number;
      riskLevel: string;
      reasonCodes: Prisma.JsonValue;
      modelConfidence: number;
    } | null;
    alert?: {
      id: string;
      status: string;
      severity: string;
    } | null;
    account?: {
      id: string;
      accountNumber: string;
    };
  }) {
    return {
      transactionId: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      transactionType: transaction.transactionType,
      status: transaction.status,
      decision: transaction.decision,
      merchantName: transaction.merchantName,
      merchantCategory: transaction.merchantCategory,
      idempotencyKey: transaction.idempotencyKey,
      correlationId: transaction.correlationId,
      initiatedAt: transaction.initiatedAt,
      processedAt: transaction.processedAt,
      account: transaction.account
        ? {
            id: transaction.account.id,
            accountNumber: transaction.account.accountNumber,
          }
        : null,
      risk: transaction.riskAssessment
        ? {
            riskScore: transaction.riskAssessment.riskScore,
            riskLevel: transaction.riskAssessment.riskLevel,
            reasonCodes: transaction.riskAssessment.reasonCodes,
            modelConfidence: transaction.riskAssessment.modelConfidence,
          }
        : null,
      alert: transaction.alert
        ? {
            id: transaction.alert.id,
            status: transaction.alert.status,
            severity: transaction.alert.severity,
          }
        : null,
    };
  }

  private assertAccess(ownerUserId: string, roles: string[], currentUserId: string) {
    const privileged =
      roles.includes(ROLES.ADMIN) || roles.includes(ROLES.RISK_ANALYST);

    if (!privileged && ownerUserId !== currentUserId) {
      throw new ForbiddenException('You do not have access to this transaction.');
    }
  }

  private toStatus(decision: 'APPROVE' | 'HOLD' | 'BLOCK') {
    if (decision === 'APPROVE') {
      return 'APPROVED';
    }

    if (decision === 'HOLD') {
      return 'HELD';
    }

    return 'BLOCKED';
  }

  private nextAverage(currentAverage: number, amount: number) {
    if (currentAverage === 0) {
      return amount;
    }

    return Number((((currentAverage * 29) + amount) / 30).toFixed(2));
  }

  private nextTrustedDevices(
    trustedDevices: string[],
    deviceFingerprint: string | undefined,
    decision: 'APPROVE' | 'HOLD' | 'BLOCK',
  ) {
    if (!deviceFingerprint || decision !== 'APPROVE') {
      return trustedDevices;
    }

    return trustedDevices.includes(deviceFingerprint)
      ? trustedDevices
      : [...trustedDevices, deviceFingerprint];
  }
}
