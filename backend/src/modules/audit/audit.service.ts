import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditRepository } from './repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async log(
    data: {
      actorType: 'SYSTEM' | 'USER' | 'ANALYST' | 'ADMIN';
      actorId?: string;
      action: string;
      entityType: string;
      entityId: string;
      correlationId: string;
      metadata: Record<string, unknown>;
    },
    tx?: Prisma.TransactionClient,
  ) {
    return this.auditRepository.create(
      {
        actorType: data.actorType,
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        correlationId: data.correlationId,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      tx,
    );
  }
}
