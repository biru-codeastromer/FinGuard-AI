import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: string) {
    const user = await this.usersRepository.findByIdWithRelations(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      status: user.status,
      roles: user.roles.map((entry) => entry.role.name),
      behaviorProfile: user.behaviorProfile
        ? {
            txCount24h: user.behaviorProfile.txCount24h,
            avgTxAmount30d: Number(user.behaviorProfile.avgTxAmount30d),
            commonGeo: user.behaviorProfile.commonGeo,
            trustedDevices:
              (user.behaviorProfile.trustedDevices as string[] | null) ?? [],
          }
        : null,
      accounts: user.accounts.map((account) => ({
        id: account.id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        availableBalance: Number(account.availableBalance),
        ledgerBalance: Number(account.ledgerBalance),
        currency: account.currency,
        status: account.status,
      })),
    };
  }
}
