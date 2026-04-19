import { Injectable } from '@nestjs/common';
import type {
  RiskAssessmentInput,
  RiskAssessmentResult,
  RiskModelStrategy,
  RiskSignal,
} from '../interfaces/risk-model-strategy.interface';

@Injectable()
export class HybridRiskStrategy implements RiskModelStrategy {
  readonly name = 'HYBRID' as const;

  evaluate(input: RiskAssessmentInput): RiskAssessmentResult {
    const signals: RiskSignal[] = [];

    if (input.amount >= Number(input.rules.find((rule) => rule.ruleType === 'AMOUNT')?.conditionJson.minAmount ?? 50000)) {
      signals.push({
        signalType: 'RULE',
        signalKey: 'HIGH_AMOUNT',
        signalValue: input.amount,
        weight: 30,
        triggered: true,
      });
    }

    if (
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

    if (
      input.deviceFingerprint &&
      !input.behavior.trustedDevices.includes(input.deviceFingerprint)
    ) {
      signals.push({
        signalType: 'BEHAVIOR',
        signalKey: 'NEW_DEVICE',
        signalValue: 1,
        weight: 18,
        triggered: true,
      });
    }

    if (input.behavior.avgTxAmount30d > 0) {
      const ratio = input.amount / input.behavior.avgTxAmount30d;
      if (ratio >= 3) {
        signals.push({
          signalType: 'MODEL',
          signalKey: 'AMOUNT_SPIKE',
          signalValue: Number(ratio.toFixed(2)),
          weight: 14,
          triggered: true,
        });
      }
    }

    if (input.behavior.txCount24h >= 8) {
      signals.push({
        signalType: 'MODEL',
        signalKey: 'HIGH_VELOCITY',
        signalValue: input.behavior.txCount24h,
        weight: 10,
        triggered: true,
      });
    }

    if (
      ['electronics', 'luxury', 'gift-cards'].includes(
        (input.merchantCategory ?? '').toLowerCase(),
      )
    ) {
      signals.push({
        signalType: 'MODEL',
        signalKey: 'SENSITIVE_CATEGORY',
        signalValue: 1,
        weight: 8,
        triggered: true,
      });
    }

    const score = Math.min(
      98,
      signals.reduce((total, signal) => total + signal.weight, 0),
    );

    return {
      riskScore: score,
      riskLevel: this.toRiskLevel(score),
      decision: this.toDecision(score),
      reasonCodes: signals.map((signal) => signal.signalKey),
      modelConfidence: 0.88,
      signals,
      strategy: this.name,
    };
  }

  private toDecision(score: number): 'APPROVE' | 'HOLD' | 'BLOCK' {
    if (score >= 88) {
      return 'BLOCK';
    }

    if (score >= 58) {
      return 'HOLD';
    }

    return 'APPROVE';
  }

  private toRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 88) {
      return 'CRITICAL';
    }

    if (score >= 62) {
      return 'HIGH';
    }

    if (score >= 30) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
