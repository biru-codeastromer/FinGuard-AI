import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transactions')
  createTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.transactionsService.createTransaction(dto, user);
  }

  @Get('transactions/:transactionId')
  getTransaction(
    @Param('transactionId') transactionId: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.transactionsService.getTransaction(transactionId, user);
  }

  @Get('accounts/:accountId/transactions')
  listAccountTransactions(
    @Param('accountId') accountId: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.transactionsService.listForAccount(accountId, user);
  }
}
