import { apiClient } from './client';
import type {
  Account,
  AlertSummary,
  AuthResponse,
  DashboardOverview,
  RuleSummary,
  TransactionPayload,
  TransactionSummary,
} from '../types/api';

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<DashboardOverview>('/dashboard/overview');
  return data;
}

export async function getAdminMetrics(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<DashboardOverview>(
    '/admin/monitoring/metrics',
  );
  return data;
}

export async function getAccounts(): Promise<Account[]> {
  const { data } = await apiClient.get<Account[]>('/accounts');
  return data;
}

export async function getAlerts(): Promise<AlertSummary[]> {
  const { data } = await apiClient.get<AlertSummary[]>('/alerts');
  return data;
}

export async function getRules(): Promise<RuleSummary[]> {
  const { data } = await apiClient.get<RuleSummary[]>('/rules');
  return data;
}

export async function createTransaction(
  payload: TransactionPayload,
): Promise<TransactionSummary> {
  const { data } = await apiClient.post<TransactionSummary>(
    '/transactions',
    payload,
  );
  return data;
}

export async function updateAlert(alertId: string, status: string) {
  const { data } = await apiClient.patch(`/alerts/${alertId}`, {
    status,
    actionNote: `Updated from the FinGuard workspace to ${status}.`,
  });
  return data;
}
