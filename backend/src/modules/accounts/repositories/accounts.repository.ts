import { Injectable } from '@nestjs/common';
import { Prisma, type PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient | PrismaClient;

@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByIdDetailed(accountId: string) {
    return this.prisma.account.findUnique({
      where: { id: accountId },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
            behaviorProfile: true,
          },
        },
      },
    });
  }

  async updateBalances(
    accountId: string,
    balances: { availableBalance: number; ledgerBalance: number },
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.db(tx);
    return db.account.update({
      where: { id: accountId },
      data: {
        availableBalance: new Prisma.Decimal(balances.availableBalance),
        ledgerBalance: new Prisma.Decimal(balances.ledgerBalance),
      },
    });
  }

  private db(tx?: Prisma.TransactionClient): DbClient {
    return tx ?? this.prisma;
  }
}
