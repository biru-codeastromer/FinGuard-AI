import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AuditModule } from '../audit/audit.module';
import { RiskModule } from '../risk/risk.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './repositories/transactions.repository';

@Module({
  imports: [AccountsModule, RiskModule, AlertsModule, AuditModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
  exports: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
