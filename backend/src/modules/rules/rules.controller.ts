import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';
import { CreateRuleDto } from './dto/create-rule.dto';
import { RulesService } from './rules.service';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Roles(ROLES.ADMIN, ROLES.RISK_ANALYST)
  @Get()
  listRules() {
    return this.rulesService.list();
  }

  @Roles(ROLES.ADMIN)
  @Post()
  createRule(@Body() dto: CreateRuleDto) {
    return this.rulesService.create(dto);
  }
}
