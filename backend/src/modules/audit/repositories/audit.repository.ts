import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient | PrismaClient;

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.AuditLogUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.db(tx);
    return db.auditLog.create({
      data,
    });
  }

  private db(tx?: Prisma.TransactionClient): DbClient {
    return tx ?? this.prisma;
  }
}
