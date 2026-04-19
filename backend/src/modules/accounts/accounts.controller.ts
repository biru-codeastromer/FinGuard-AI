import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  listAccounts(@CurrentUserDecorator() user: CurrentUser) {
    return this.accountsService.listForUser(user);
  }

  @Get(':accountId')
  getAccount(
    @Param('accountId') accountId: string,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.accountsService.getById(accountId, user);
  }
}
