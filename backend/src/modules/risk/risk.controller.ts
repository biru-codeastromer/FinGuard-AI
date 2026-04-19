import { Controller, Get, Param } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get('transactions/:transactionId')
  getTransactionRisk(@Param('transactionId') transactionId: string) {
    return this.riskService.getTransactionRisk(transactionId);
  }
}
