import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateRuleDto } from '../dto/create-rule.dto';

@Injectable()
export class RulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveRules() {
    return this.prisma.fraudRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findAll() {
    return this.prisma.fraudRule.findMany({
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(dto: CreateRuleDto) {
    return this.prisma.fraudRule.create({
      data: {
        ruleName: dto.ruleName,
        ruleType: dto.ruleType,
        priority: dto.priority,
        action: dto.action,
        conditionJson: dto.conditionJson as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
      },
    });
  }
}
