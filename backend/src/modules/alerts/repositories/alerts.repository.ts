import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient | PrismaClient;

@Injectable()
export class AlertsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyForUser(userId?: string) {
    return this.prisma.alert.findMany({
      where: userId
        ? {
            OR: [
              { assignedToUserId: userId },
              {
                transaction: {
                  account: {
                    userId,
                  },
                },
              },
            ],
          }
        : undefined,
      include: {
        transaction: {
          include: {
            account: true,
          },
        },
        assignedTo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createAlert(
    data: Prisma.AlertUncheckedCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.alert.create({
      data,
    });
  }

  async createNotifications(
    data: Prisma.NotificationUncheckedCreateInput[],
    tx: Prisma.TransactionClient,
  ) {
    if (data.length === 0) {
      return;
    }

    await tx.notification.createMany({ data });
  }

  async updateAlert(
    alertId: string,
    data: Prisma.AlertUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.db(tx);
    return db.alert.update({
      where: { id: alertId },
      data,
      include: {
        transaction: true,
        assignedTo: true,
      },
    });
  }

  async findById(alertId: string) {
    return this.prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        transaction: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  private db(tx?: Prisma.TransactionClient): DbClient {
    return tx ?? this.prisma;
  }
}
