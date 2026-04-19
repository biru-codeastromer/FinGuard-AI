export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  RISK_ANALYST: 'RISK_ANALYST',
  ADMIN: 'ADMIN',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];
