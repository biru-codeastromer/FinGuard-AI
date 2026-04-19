import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ROLES } from '../../common/constants/roles';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(user: CurrentUser) {
    if (user.roles.includes(ROLES.ADMIN) || user.roles.includes(ROLES.RISK_ANALYST)) {
      return this.getOperationsOverview();
    }

    const userAccounts = await this.prisma.account.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'asc' },
    });

    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: {
          userId: user.sub,
        },
      },
      include: {
        riskAssessment: true,
        alert: true,
      },
      orderBy: {
        initiatedAt: 'desc',
      },
      take: 6,
    });

    const alerts = await this.prisma.alert.findMany({
      where: {
        transaction: {
          account: {
            userId: user.sub,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

    return {
      mode: 'customer',
      portfolioValue: userAccounts.reduce(
        (sum, account) => sum + Number(account.availableBalance),
        0,
      ),
      accounts: userAccounts.map((account) => ({
        id: account.id,
        accountNumber: account.accountNumber,
        balance: Number(account.availableBalance),
        currency: account.currency,
        status: account.status,
      })),
      recentTransactions: transactions.map((transaction) => ({
        id: transaction.id,
        merchantName: transaction.merchantName,
        amount: Number(transaction.amount),
        status: transaction.status,
        decision: transaction.decision,
        riskScore: transaction.riskAssessment?.riskScore ?? null,
        createdAt: transaction.initiatedAt,
      })),
      alerts: alerts.map((alert) => ({
        id: alert.id,
        title: alert.title,
        severity: alert.severity,
        status: alert.status,
        createdAt: alert.createdAt,
      })),
    };
  }

  async getAdminMetrics() {
    return this.getOperationsOverview();
  }

  private async getOperationsOverview() {
    const [
      totalTransactions,
      approvedTransactions,
      flaggedTransactions,
      openAlerts,
      avgRisk,
      latestTransactions,
    ] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({
        where: {
          decision: 'APPROVE',
        },
      }),
      this.prisma.transaction.count({
        where: {
          decision: {
            in: ['HOLD', 'BLOCK'],
          },
        },
      }),
      this.prisma.alert.count({
        where: {
          status: {
            not: 'RESOLVED',
          },
        },
      }),
      this.prisma.riskAssessment.aggregate({
        _avg: {
          riskScore: true,
        },
      }),
      this.prisma.transaction.findMany({
        include: {
          account: {
            include: {
              user: true,
            },
          },
          riskAssessment: true,
        },
        orderBy: {
          initiatedAt: 'desc',
        },
        take: 6,
      }),
    ]);

    return {
      mode: 'operations',
      totalTransactions,
      approvalRate:
        totalTransactions > 0
          ? Number(((approvedTransactions / totalTransactions) * 100).toFixed(1))
          : 0,
      flaggedTransactions,
      openAlerts,
      averageRiskScore: Number((avgRisk._avg.riskScore ?? 0).toFixed(1)),
      recentTransactions: latestTransactions.map((transaction) => ({
        id: transaction.id,
        customerName: transaction.account.user.fullName,
        merchantName: transaction.merchantName,
        amount: Number(transaction.amount),
        decision: transaction.decision,
        riskScore: transaction.riskAssessment?.riskScore ?? null,
        createdAt: transaction.initiatedAt,
      })),
    };
  }
}
