import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ROLES } from '../../common/constants/roles';
import type { CurrentUser } from '../../common/interfaces/current-user.interface';
import { AccountsRepository } from './repositories/accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async listForUser(user: CurrentUser) {
    if (this.isPrivileged(user.roles)) {
      const privilegedView = await this.accountsRepository.findByUserId(user.sub);
      return privilegedView.map((account) => this.serializeAccount(account));
    }

    const accounts = await this.accountsRepository.findByUserId(user.sub);
    return accounts.map((account) => this.serializeAccount(account));
  }

  async getById(accountId: string, user: CurrentUser) {
    const account = await this.accountsRepository.findByIdDetailed(accountId);

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    if (!this.isPrivileged(user.roles) && account.userId !== user.sub) {
      throw new ForbiddenException('You do not have access to this account.');
    }

    return {
      ...this.serializeAccount(account),
      owner: {
        id: account.user.id,
        fullName: account.user.fullName,
        email: account.user.email,
        roles: account.user.roles.map((entry) => entry.role.name),
      },
      behaviorProfile: account.user.behaviorProfile
        ? {
            txCount24h: account.user.behaviorProfile.txCount24h,
            avgTxAmount30d: Number(account.user.behaviorProfile.avgTxAmount30d),
            commonGeo: account.user.behaviorProfile.commonGeo,
            trustedDevices:
              (account.user.behaviorProfile.trustedDevices as string[] | null) ??
              [],
          }
        : null,
    };
  }

  private serializeAccount(account: {
    id: string;
    accountNumber: string;
    accountType: string;
    availableBalance: Prisma.Decimal;
    ledgerBalance: Prisma.Decimal;
    currency: string;
    status: string;
    createdAt: Date;
  }) {
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      availableBalance: Number(account.availableBalance),
      ledgerBalance: Number(account.ledgerBalance),
      currency: account.currency,
      status: account.status,
      createdAt: account.createdAt,
    };
  }

  private isPrivileged(roles: string[]) {
    return roles.includes(ROLES.ADMIN) || roles.includes(ROLES.RISK_ANALYST);
  }
}
