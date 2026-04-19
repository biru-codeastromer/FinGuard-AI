import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RulesRepository } from '../rules/repositories/rules.repository';
import { RiskModelFactory } from './factories/risk-model.factory';
import type {
  RiskAssessmentInput,
  RiskAssessmentResult,
} from './interfaces/risk-model-strategy.interface';

@Injectable()
export class RiskService {
  constructor(
    private readonly rulesRepository: RulesRepository,
    private readonly riskModelFactory: RiskModelFactory,
    private readonly prisma: PrismaService,
  ) {}

  async assess(input: Omit<RiskAssessmentInput, 'rules'>): Promise<RiskAssessmentResult> {
    const rules = await this.rulesRepository.findActiveRules();
    const normalizedInput: RiskAssessmentInput = {
      ...input,
      rules: rules.map((rule) => ({
        id: rule.id,
        ruleName: rule.ruleName,
        ruleType: rule.ruleType,
        priority: rule.priority,
        action: rule.action,
        conditionJson: rule.conditionJson as Record<string, unknown>,
      })),
    };

    const strategy = this.riskModelFactory.getStrategy(normalizedInput);
    return strategy.evaluate(normalizedInput);
  }

  async getTransactionRisk(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        riskAssessment: true,
        fraudSignals: true,
      },
    });

    if (!transaction || !transaction.riskAssessment) {
      throw new NotFoundException('Risk assessment not found for this transaction.');
    }

    return {
      transactionId: transaction.id,
      decision: transaction.decision,
      riskScore: transaction.riskAssessment.riskScore,
      riskLevel: transaction.riskAssessment.riskLevel,
      modelConfidence: transaction.riskAssessment.modelConfidence,
      reasonCodes: transaction.riskAssessment.reasonCodes,
      signals: transaction.fraudSignals.map((signal) => ({
        signalType: signal.signalType,
        signalKey: signal.signalKey,
        signalValue: signal.signalValue,
        weight: signal.weight,
        triggered: signal.triggered,
      })),
    };
  }
}
