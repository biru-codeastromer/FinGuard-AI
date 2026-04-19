export interface AuthAccount {
  id: string;
  accountNumber: string;
  availableBalance: number;
  currency: string;
  status: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  accounts: AuthAccount[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  availableBalance: number;
  ledgerBalance?: number;
  currency: string;
  status: string;
}

export interface AlertSummary {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  transaction: {
    id: string;
    amount: number;
    currency: string;
    merchantName?: string | null;
    decision?: string | null;
  };
  assignedTo?: {
    id: string;
    fullName: string;
    email?: string;
  } | null;
}

export interface TransactionSummary {
  transactionId: string;
  amount: number;
  currency: string;
  transactionType: string;
  status: string;
  decision?: string | null;
  merchantName?: string | null;
  merchantCategory?: string | null;
  correlationId: string;
  initiatedAt: string;
  processedAt?: string | null;
  risk?: {
    riskScore: number;
    riskLevel: string;
    reasonCodes: string[];
    modelConfidence: number;
  } | null;
  alert?: {
    id: string;
    status: string;
    severity: string;
  } | null;
}

export interface CustomerOverview {
  mode: 'customer';
  portfolioValue: number;
  accounts: Array<{
    id: string;
    accountNumber: string;
    balance: number;
    currency: string;
    status: string;
  }>;
  recentTransactions: Array<{
    id: string;
    merchantName?: string | null;
    amount: number;
    status: string;
    decision?: string | null;
    riskScore?: number | null;
    createdAt: string;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
  }>;
}

export interface OperationsOverview {
  mode: 'operations';
  totalTransactions: number;
  approvalRate: number;
  flaggedTransactions: number;
  openAlerts: number;
  averageRiskScore: number;
  recentTransactions: Array<{
    id: string;
    customerName: string;
    merchantName?: string | null;
    amount: number;
    decision?: string | null;
    riskScore?: number | null;
    createdAt: string;
  }>;
}

export type DashboardOverview = CustomerOverview | OperationsOverview;

export interface RuleSummary {
  id: string;
  ruleName: string;
  ruleType: string;
  priority: number;
  action: string;
  conditionJson: Record<string, unknown>;
  isActive: boolean;
}

export interface TransactionPayload {
  accountId: string;
  amount: number;
  currency: string;
  transactionType: 'DEBIT' | 'CREDIT';
  merchantName?: string;
  merchantCategory?: string;
  geoLocation?: string;
  sourceIp?: string;
  deviceFingerprint?: string;
  idempotencyKey: string;
}
