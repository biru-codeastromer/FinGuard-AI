import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ROLES, type RoleName } from '../../../common/constants/roles';

type DbClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        accounts: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        behaviorProfile: true,
      },
    });
  }

  async findByIdWithRelations(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        accounts: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        behaviorProfile: true,
      },
    });
  }

  async findFirstByRole(roleName: RoleName) {
    return this.prisma.user.findFirst({
      where: {
        roles: {
          some: {
            role: {
              name: roleName,
            },
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createCustomer(data: {
    email: string;
    fullName: string;
    passwordHash: string;
    phone?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const customerRole = await this.ensureRole(ROLES.CUSTOMER, tx);
      const user = await tx.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          passwordHash: data.passwordHash,
          phone: data.phone,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: customerRole.id,
        },
      });

      await tx.behaviorProfile.create({
        data: {
          userId: user.id,
          txCount24h: 0,
          avgTxAmount30d: new Prisma.Decimal(0),
          trustedDevices: [],
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          accountNumber: this.buildAccountNumber(),
          accountType: 'PRIMARY',
          availableBalance: new Prisma.Decimal(150000),
          ledgerBalance: new Prisma.Decimal(150000),
          currency: 'INR',
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          accounts: true,
          behaviorProfile: true,
        },
      });
    });
  }

  private buildAccountNumber() {
    const suffix = `${Date.now()}`.slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    return `FG-${suffix}${random}`;
  }

  private async ensureRole(roleName: RoleName, tx: DbClient) {
    return tx.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} access role`,
      },
    });
  }
}
