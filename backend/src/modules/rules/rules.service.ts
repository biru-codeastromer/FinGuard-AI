import { Injectable } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { RulesRepository } from './repositories/rules.repository';

@Injectable()
export class RulesService {
  constructor(private readonly rulesRepository: RulesRepository) {}

  async list() {
    const rules = await this.rulesRepository.findAll();
    return rules.map((rule) => ({
      id: rule.id,
      ruleName: rule.ruleName,
      ruleType: rule.ruleType,
      priority: rule.priority,
      action: rule.action,
      conditionJson: rule.conditionJson,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    }));
  }

  async create(dto: CreateRuleDto) {
    return this.rulesRepository.create(dto);
  }
}
