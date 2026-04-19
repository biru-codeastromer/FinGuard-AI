require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureRoles() {
  const roles = [
    {
      name: 'CUSTOMER',
      description: 'Default customer access for the finance workspace.',
    },
    {
      name: 'RISK_ANALYST',
      description: 'Can review alerts and monitor suspicious activity.',
    },
    {
      name: 'ADMIN',
      description: 'Can manage fraud rules and operational settings.',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'demo@finguard.ai' },
    update: {
      fullName: 'Aarav Kapoor',
      passwordHash,
      phone: '+91-9876543210',
    },
    create: {
      email: 'demo@finguard.ai',
      fullName: 'Aarav Kapoor',
      phone: '+91-9876543210',
      passwordHash,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@finguard.ai' },
    update: {
      fullName: 'Riya Sen',
      passwordHash,
      phone: '+91-9988776655',
    },
    create: {
      email: 'analyst@finguard.ai',
      fullName: 'Riya Sen',
      phone: '+91-9988776655',
      passwordHash,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@finguard.ai' },
    update: {
      fullName: 'Kabir Sharma',
      passwordHash,
      phone: '+91-9090909090',
    },
    create: {
      email: 'admin@finguard.ai',
      fullName: 'Kabir Sharma',
      phone: '+91-9090909090',
      passwordHash,
    },
  });

  const [customerRole, analystRole, adminRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'CUSTOMER' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'RISK_ANALYST' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'ADMIN' } }),
  ]);

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: customer.id, roleId: customerRole.id } },
    update: {},
    create: { userId: customer.id, roleId: customerRole.id },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: analyst.id, roleId: analystRole.id } },
    update: {},
    create: { userId: analyst.id, roleId: analystRole.id },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  return { customer, analyst, admin };
}

async function seedAccounts(customer) {
  const account = await prisma.account.upsert({
    where: { accountNumber: 'FG-2026-001' },
    update: {
      availableBalance: '245000.00',
      ledgerBalance: '245000.00',
      status: 'ACTIVE',
    },
    create: {
      userId: customer.id,
      accountNumber: 'FG-2026-001',
      accountType: 'PRIMARY',
      availableBalance: '245000.00',
      ledgerBalance: '245000.00',
      currency: 'INR',
      status: 'ACTIVE',
    },
  });

  await prisma.behaviorProfile.upsert({
    where: { userId: customer.id },
    update: {
      txCount24h: 4,
      avgTxAmount30d: '18250.00',
      commonGeo: 'Bengaluru',
      trustedDevices: ['device-primary', 'device-travel'],
    },
    create: {
      userId: customer.id,
      txCount24h: 4,
      avgTxAmount30d: '18250.00',
      commonGeo: 'Bengaluru',
      trustedDevices: ['device-primary', 'device-travel'],
    },
  });

  return account;
}

async function seedRules() {
  const rules = [
    {
      ruleName: 'high_value_hold',
      ruleType: 'AMOUNT',
      priority: 1,
      action: 'HOLD',
      conditionJson: { minAmount: 50000 },
    },
    {
      ruleName: 'geo_mismatch_review',
      ruleType: 'GEO',
      priority: 2,
      action: 'HOLD',
      conditionJson: { requiresKnownGeo: true },
    },
    {
      ruleName: 'new_device_watch',
      ruleType: 'DEVICE',
      priority: 3,
      action: 'APPROVE',
      conditionJson: { weight: 18 },
    },
  ];

  for (const rule of rules) {
    await prisma.fraudRule.upsert({
      where: { ruleName: rule.ruleName },
      update: rule,
      create: rule,
    });
  }
}

async function seedTransactions(account, analyst, customer) {
  const txOne = await prisma.transaction.upsert({
    where: { idempotencyKey: 'seed-approved-001' },
    update: {},
    create: {
      accountId: account.id,
      transactionType: 'DEBIT',
      amount: '8450.00',
      currency: 'INR',
      merchantName: 'Blinkit',
      merchantCategory: 'Groceries',
      sourceIp: '49.205.18.1',
      deviceFingerprint: 'device-primary',
      geoLocation: 'Bengaluru',
      status: 'APPROVED',
      decision: 'APPROVE',
      correlationId: 'corr-seed-approved-001',
      idempotencyKey: 'seed-approved-001',
      processedAt: new Date(),
    },
  });

  await prisma.riskAssessment.upsert({
    where: { transactionId: txOne.id },
    update: {},
    create: {
      transactionId: txOne.id,
      riskScore: 18,
      riskLevel: 'LOW',
      decision: 'APPROVE',
      modelConfidence: 0.92,
      reasonCodes: ['KNOWN_DEVICE', 'KNOWN_GEO', 'NORMAL_AMOUNT'],
    },
  });

  const txTwo = await prisma.transaction.upsert({
    where: { idempotencyKey: 'seed-held-001' },
    update: {},
    create: {
      accountId: account.id,
      transactionType: 'DEBIT',
      amount: '72800.00',
      currency: 'INR',
      merchantName: 'Global Gadgets',
      merchantCategory: 'Electronics',
      sourceIp: '103.44.12.7',
      deviceFingerprint: 'device-unknown-9',
      geoLocation: 'Dubai',
      status: 'HELD',
      decision: 'HOLD',
      correlationId: 'corr-seed-held-001',
      idempotencyKey: 'seed-held-001',
      processedAt: new Date(),
    },
  });

  await prisma.riskAssessment.upsert({
    where: { transactionId: txTwo.id },
    update: {},
    create: {
      transactionId: txTwo.id,
      riskScore: 81,
      riskLevel: 'CRITICAL',
      decision: 'HOLD',
      modelConfidence: 0.88,
      reasonCodes: ['HIGH_AMOUNT', 'NEW_DEVICE', 'GEO_MISMATCH'],
    },
  });

  await prisma.fraudSignal.createMany({
    data: [
      {
        transactionId: txTwo.id,
        signalType: 'RULE',
        signalKey: 'HIGH_AMOUNT',
        signalValue: 72800,
        weight: 34,
        triggered: true,
      },
      {
        transactionId: txTwo.id,
        signalType: 'BEHAVIOR',
        signalKey: 'NEW_DEVICE',
        signalValue: 1,
        weight: 22,
        triggered: true,
      },
      {
        transactionId: txTwo.id,
        signalType: 'BEHAVIOR',
        signalKey: 'GEO_MISMATCH',
        signalValue: 1,
        weight: 25,
        triggered: true,
      },
    ],
    skipDuplicates: true,
  });

  const alert = await prisma.alert.upsert({
    where: { transactionId: txTwo.id },
    update: {},
    create: {
      transactionId: txTwo.id,
      assignedToUserId: analyst.id,
      severity: 'CRITICAL',
      status: 'IN_REVIEW',
      title: 'Hold: suspicious cross-border electronics payment',
      description:
        'Transaction held because of a large amount, untrusted device, and a geo mismatch against the customer profile.',
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        alertId: alert.id,
        userId: customer.id,
        channel: 'EMAIL',
        templateKey: 'risk_hold_customer',
        deliveryStatus: 'SENT',
        sentAt: new Date(),
      },
      {
        alertId: alert.id,
        userId: analyst.id,
        channel: 'IN_APP',
        templateKey: 'risk_hold_analyst',
        deliveryStatus: 'SENT',
        sentAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorType: 'SYSTEM',
        action: 'TRANSACTION_APPROVED',
        entityType: 'TRANSACTION',
        entityId: txOne.id,
        correlationId: txOne.correlationId,
        metadata: {
          merchantName: txOne.merchantName,
          decision: txOne.decision,
        },
      },
      {
        actorType: 'SYSTEM',
        action: 'TRANSACTION_HELD',
        entityType: 'TRANSACTION',
        entityId: txTwo.id,
        correlationId: txTwo.correlationId,
        metadata: {
          merchantName: txTwo.merchantName,
          decision: txTwo.decision,
        },
      },
    ],
    skipDuplicates: true,
  });
}

async function main() {
  await ensureRoles();
  const users = await seedUsers();
  const account = await seedAccounts(users.customer);
  await seedRules();
  await seedTransactions(account, users.analyst, users.customer);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
