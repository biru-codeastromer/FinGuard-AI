import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient | PrismaClient;

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(transactionId: string, tx?: Prisma.TransactionClient) {
    const db = this.db(tx);
    return db.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: true,
        riskAssessment: true,
        fraudSignals: true,
        alert: true,
      },
    });
  }

  async findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.transaction.findUnique({
      where: { idempotencyKey },
      include: {
        account: true,
        riskAssessment: true,
        fraudSignals: true,
        alert: true,
      },
    });
  }

  async findByAccountId(accountId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId },
      include: {
        riskAssessment: true,
        alert: true,
      },
      orderBy: {
        initiatedAt: 'desc',
      },
    });
  }

  async createTransaction(
    data: Prisma.TransactionUncheckedCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.transaction.create({
      data,
    });
  }

  async createRiskAssessment(
    data: Prisma.RiskAssessmentUncheckedCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.riskAssessment.create({
      data,
    });
  }

  async createFraudSignals(
    data: Prisma.FraudSignalUncheckedCreateInput[],
    tx: Prisma.TransactionClient,
  ) {
    if (data.length === 0) {
      return;
    }

    await tx.fraudSignal.createMany({
      data,
    });
  }

  private db(tx?: Prisma.TransactionClient): DbClient {
    return tx ?? this.prisma;
  }
}
