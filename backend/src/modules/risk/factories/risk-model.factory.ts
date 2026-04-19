import { Injectable } from '@nestjs/common';
import { HybridRiskStrategy } from '../strategies/hybrid-risk.strategy';
import { RuleOnlyStrategy } from '../strategies/rule-only.strategy';
import type {
  RiskAssessmentInput,
  RiskModelStrategy,
} from '../interfaces/risk-model-strategy.interface';

@Injectable()
export class RiskModelFactory {
  constructor(
    private readonly ruleOnlyStrategy: RuleOnlyStrategy,
    private readonly hybridRiskStrategy: HybridRiskStrategy,
  ) {}

  getStrategy(input: RiskAssessmentInput): RiskModelStrategy {
    const hasBehaviorAnomaly =
      Boolean(input.geoLocation && input.behavior.commonGeo && input.geoLocation !== input.behavior.commonGeo) ||
      Boolean(
        input.deviceFingerprint &&
          !input.behavior.trustedDevices.includes(input.deviceFingerprint),
      );

    if (input.amount >= 25000 || input.behavior.txCount24h >= 6 || hasBehaviorAnomaly) {
      return this.hybridRiskStrategy;
    }

    return this.ruleOnlyStrategy;
  }
}
