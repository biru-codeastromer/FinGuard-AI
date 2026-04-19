import { Injectable } from '@nestjs/common';
import type {
  RiskAssessmentInput,
  RiskAssessmentResult,
  RiskModelStrategy,
  RiskSignal,
} from '../interfaces/risk-model-strategy.interface';

@Injectable()
export class RuleOnlyStrategy implements RiskModelStrategy {
  readonly name = 'RULE_ONLY' as const;

  evaluate(input: RiskAssessmentInput): RiskAssessmentResult {
    const signals: RiskSignal[] = [];

    for (const rule of input.rules) {
      if (rule.ruleType === 'AMOUNT') {
        const minAmount = Number(rule.conditionJson.minAmount ?? 0);
        if (input.amount >= minAmount) {
          signals.push({
            signalType: 'RULE',
            signalKey: 'HIGH_AMOUNT',
            signalValue: input.amount,
            weight: 32,
            triggered: true,
          });
        }
      }

      if (
        rule.ruleType === 'GEO' &&
        input.behavior.commonGeo &&
        input.geoLocation &&
        input.behavior.commonGeo.toLowerCase() !== input.geoLocation.toLowerCase()
      ) {
        signals.push({
          signalType: 'BEHAVIOR',
          signalKey: 'GEO_MISMATCH',
          signalValue: 1,
          weight: 24,
          triggered: true,
        });
      }

      if (rule.ruleType === 'DEVICE' && input.deviceFingerprint) {
        const trustedDevices = input.behavior.trustedDevices ?? [];
        if (!trustedDevices.includes(input.deviceFingerprint)) {
          signals.push({
            signalType: 'BEHAVIOR',
            signalKey: 'NEW_DEVICE',
            signalValue: 1,
            weight: Number(rule.conditionJson.weight ?? 18),
            triggered: true,
          });
        }
      }
    }

    const score = Math.min(
      95,
      signals.reduce((total, signal) => total + signal.weight, 0),
    );

    return {
      riskScore: score,
      riskLevel: this.toRiskLevel(score),
      decision: this.toDecision(score),
      reasonCodes: signals.map((signal) => signal.signalKey),
      modelConfidence: signals.length > 0 ? 0.84 : 0.62,
      signals,
      strategy: this.name,
    };
  }

  private toDecision(score: number): 'APPROVE' | 'HOLD' | 'BLOCK' {
    if (score >= 85) {
      return 'BLOCK';
    }

    if (score >= 55) {
      return 'HOLD';
    }

    return 'APPROVE';
  }

  private toRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 85) {
      return 'CRITICAL';
    }

    if (score >= 60) {
      return 'HIGH';
    }

    if (score >= 30) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
