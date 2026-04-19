import { Module } from '@nestjs/common';
import { RulesModule } from '../rules/rules.module';
import { RiskModelFactory } from './factories/risk-model.factory';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { HybridRiskStrategy } from './strategies/hybrid-risk.strategy';
import { RuleOnlyStrategy } from './strategies/rule-only.strategy';

@Module({
  imports: [RulesModule],
  controllers: [RiskController],
  providers: [
    RiskService,
    RuleOnlyStrategy,
    HybridRiskStrategy,
    RiskModelFactory,
  ],
  exports: [RiskService],
})
export class RiskModule {}
