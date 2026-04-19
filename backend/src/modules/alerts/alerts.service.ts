import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ROLES } from '../../common/constants/roles';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertsRepository } from './repositories/alerts.repository';

@Injectable()
export class AlertsService {
  constructor(
    private readonly alertsRepository: AlertsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async handleDecision(
    data: {
      transactionId: string;
      customerUserId: string;
      riskScore: number;
      decision: 'APPROVE' | 'HOLD' | 'BLOCK';
      reasonCodes: string[];
      correlationId: string;
      merchantName?: string;
    },
    tx: Prisma.TransactionClient,
  ) {
    if (data.decision === 'APPROVE') {
      return null;
    }

    const assignee = await this.usersRepository.findFirstByRole(ROLES.RISK_ANALYST);
    const severity =
      data.riskScore >= 85
        ? 'CRITICAL'
        : data.riskScore >= 60
          ? 'HIGH'
          : 'MEDIUM';

    const alert = await this.alertsRepository.createAlert(
      {
        transactionId: data.transactionId,
        assignedToUserId: assignee?.id,
        severity,
        status: 'OPEN',
        title: `${data.decision === 'BLOCK' ? 'Blocked' : 'Held'} payment needs analyst review`,
        description: `Triggered by ${data.reasonCodes.join(', ')} for ${data.merchantName ?? 'merchant'} .`,
      },
      tx,
    );

    await this.alertsRepository.createNotifications(
      [
        {
          alertId: alert.id,
          userId: data.customerUserId,
          channel: 'EMAIL',
          templateKey: 'transaction_risk_notice',
          deliveryStatus: 'SENT',
          sentAt: new Date(),
        },
        ...(assignee
          ? [
              {
                alertId: alert.id,
                userId: assignee.id,
                channel: 'IN_APP',
                templateKey: 'analyst_queue_new_alert',
                deliveryStatus: 'SENT',
                sentAt: new Date(),
              } satisfies Prisma.NotificationUncheckedCreateInput,
            ]
          : []),
      ],
      tx,
    );

    await this.auditService.log(
      {
        actorType: 'SYSTEM',
        action: 'ALERT_CREATED',
        entityType: 'ALERT',
        entityId: alert.id,
        correlationId: data.correlationId,
        metadata: {
          severity,
          decision: data.decision,
          reasonCodes: data.reasonCodes,
        },
      },
      tx,
    );

    return alert;
  }

  async list(user: CurrentUser) {
    const alerts = this.isPrivileged(user.roles)
      ? await this.alertsRepository.findManyForUser()
      : await this.alertsRepository.findManyForUser(user.sub);

    return alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      status: alert.status,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt,
      transaction: {
        id: alert.transaction.id,
        amount: Number(alert.transaction.amount),
        currency: alert.transaction.currency,
        merchantName: alert.transaction.merchantName,
        decision: alert.transaction.decision,
      },
      assignedTo: alert.assignedTo
        ? {
            id: alert.assignedTo.id,
            fullName: alert.assignedTo.fullName,
            email: alert.assignedTo.email,
          }
        : null,
    }));
  }

  async update(alertId: string, dto: UpdateAlertDto, user: CurrentUser) {
    if (!this.isPrivileged(user.roles)) {
      throw new ForbiddenException('Only analyst and admin roles can update alerts.');
    }

    const alert = await this.alertsRepository.findById(alertId);
    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }

    const updatedAlert = await this.prisma.$transaction(async (tx) => {
      const nextAlert = await this.alertsRepository.updateAlert(
        alertId,
        {
          status: dto.status,
          resolvedAt: dto.status === 'RESOLVED' ? new Date() : null,
          assignedToUserId:
            dto.status === 'IN_REVIEW' ? alert.assignedToUserId ?? user.sub : alert.assignedToUserId,
        },
        tx,
      );

      await tx.adminAction.create({
        data: {
          adminUserId: user.sub,
          alertId,
          actionType: `ALERT_${dto.status}`,
          actionNote: dto.actionNote ?? 'Status updated from operations workspace.',
        },
      });

      await this.auditService.log(
        {
          actorType: user.roles.includes(ROLES.ADMIN) ? 'ADMIN' : 'ANALYST',
          actorId: user.sub,
          action: 'ALERT_STATUS_UPDATED',
          entityType: 'ALERT',
          entityId: alertId,
          correlationId: alert.transaction.correlationId,
          metadata: {
            status: dto.status,
            actionNote: dto.actionNote,
          },
        },
        tx,
      );

      return nextAlert;
    });

    return {
      id: updatedAlert.id,
      status: updatedAlert.status,
      resolvedAt: updatedAlert.resolvedAt,
      assignedTo: updatedAlert.assignedTo
        ? {
            id: updatedAlert.assignedTo.id,
            fullName: updatedAlert.assignedTo.fullName,
          }
        : null,
    };
  }

  private isPrivileged(roles: string[]) {
    return roles.includes(ROLES.ADMIN) || roles.includes(ROLES.RISK_ANALYST);
  }
}
