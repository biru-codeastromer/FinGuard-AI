import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, LogOut, Shield, Sparkles, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  createTransaction,
  getAccounts,
  getAdminMetrics,
  getAlerts,
  getDashboardOverview,
  getRules,
  login,
  register,
  updateAlert,
} from '../api';
import { SiteHeader } from '../components/SiteHeader';
import { clearSession, readSession, writeSession } from '../lib/session';
import type { AuthResponse, DashboardOverview, TransactionPayload } from '../types/api';

const demoAccounts = [
  { label: 'Customer demo', email: 'demo@finguard.ai', password: 'Password@123' },
  { label: 'Analyst demo', email: 'analyst@finguard.ai', password: 'Password@123' },
];

const initialTransaction = {
  accountId: '',
  amount: 72800,
  currency: 'INR',
  transactionType: 'DEBIT' as const,
  merchantName: 'Global Gadgets',
  merchantCategory: 'Electronics',
  geoLocation: 'Dubai',
  sourceIp: '103.44.12.7',
  deviceFingerprint: 'device-unknown-9',
};

export function WorkspacePage() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthResponse | null>(() => readSession());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({
    fullName: 'Aarav Kapoor',
    email: 'demo@finguard.ai',
    password: 'Password@123',
    phone: '+91-9876543210',
  });
  const [transactionForm, setTransactionForm] = useState(initialTransaction);

  const isPrivileged = Boolean(
    session?.user.roles.some((role) => role === 'ADMIN' || role === 'RISK_ANALYST'),
  );

  const overviewQuery = useQuery({
    queryKey: ['overview', session?.accessToken],
    queryFn: getDashboardOverview,
    enabled: Boolean(session),
  });

  const accountsQuery = useQuery({
    queryKey: ['accounts', session?.accessToken],
    queryFn: getAccounts,
    enabled: Boolean(session),
  });

  const alertsQuery = useQuery({
    queryKey: ['alerts', session?.accessToken],
    queryFn: getAlerts,
    enabled: Boolean(session),
  });

  const rulesQuery = useQuery({
    queryKey: ['rules', session?.accessToken],
    queryFn: getRules,
    enabled: Boolean(session && isPrivileged),
  });

  const metricsQuery = useQuery({
    queryKey: ['admin-metrics', session?.accessToken],
    queryFn: getAdminMetrics,
    enabled: Boolean(session && isPrivileged),
  });

  useEffect(() => {
    const firstAccountId = accountsQuery.data?.[0]?.id;
    if (firstAccountId && !transactionForm.accountId) {
      setTransactionForm((current) => ({ ...current, accountId: firstAccountId }));
    }
  }, [accountsQuery.data, transactionForm.accountId]);

  const authMutation = useMutation({
    mutationFn: async () => {
      if (authMode === 'login') {
        return login({
          email: authForm.email,
          password: authForm.password,
        });
      }

      return register(authForm);
    },
    onSuccess: (nextSession) => {
      startTransition(() => {
        writeSession(nextSession);
        setSession(nextSession);
      });
      setFeedback(
        authMode === 'login'
          ? 'Signed in successfully.'
          : 'Account created and signed in successfully.',
      );
      setError(null);
    },
    onError: (mutationError: unknown) => {
      setError('Could not complete authentication. Please check the backend and demo data.');
      setFeedback(null);
      console.error(mutationError);
    },
  });

  const transactionMutation = useMutation({
    mutationFn: async () => {
      if (!transactionForm.accountId) {
        throw new Error('Choose an account before submitting a transaction.');
      }

      const payload: TransactionPayload = {
        ...transactionForm,
        amount: Number(transactionForm.amount),
        idempotencyKey: `ui-${Date.now()}`,
      };

      return createTransaction(payload);
    },
    onSuccess: () => {
      setFeedback('Transaction submitted through the live risk pipeline.');
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (mutationError: unknown) => {
      setError('Transaction could not be submitted. Check the API or your database connection.');
      setFeedback(null);
      console.error(mutationError);
    },
  });

  const alertMutation = useMutation({
    mutationFn: async (alertId: string) => updateAlert(alertId, 'RESOLVED'),
    onSuccess: () => {
      setFeedback('Alert marked as resolved.');
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });

  const logout = () => {
    clearSession();
    setSession(null);
    setFeedback(null);
    setError(null);
    queryClient.clear();
  };

  const dashboard = (overviewQuery.data ?? metricsQuery.data) as DashboardOverview | undefined;

  const workspaceTitle = useMemo(() => {
    if (!session) {
      return 'Welcome to FinGuard';
    }

    return isPrivileged ? 'Risk operations workspace' : 'Customer finance workspace';
  }, [isPrivileged, session]);

  if (!session) {
    return (
      <div className="page workspace-shell">
        <SiteHeader />
        <main className="container auth-stage">
          <section className="auth-art">
            <div className="toolbar">
              <span className="status-chip status-APPROVED">Live backend required</span>
              <Link className="button button-dark" to="/">
                Back home
              </Link>
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 0.96, letterSpacing: '-0.06em', marginTop: '2rem', marginBottom: '1rem' }}>
              Screen payments with calm, explainable risk logic.
            </h1>
            <p style={{ maxWidth: 440, lineHeight: 1.7, color: 'rgba(245,255,251,0.88)' }}>
              Sign in to the real workspace to test JWT auth, transaction
              screening, seeded alerts, and the monitoring view from the SESD
              implementation.
            </p>
            <div className="auth-demo-grid" style={{ marginTop: '2rem' }}>
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="auth-demo-card"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthForm((current) => ({
                      ...current,
                      email: account.email,
                      password: account.password,
                    }));
                  }}
                >
                  <strong>{account.label}</strong>
                  <span className="muted">
                    {account.email} / {account.password}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="auth-card">
            <div className="toolbar">
              <div>
                <h2 style={{ marginBottom: '0.4rem' }}>{workspaceTitle}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {authMode === 'login'
                    ? 'Use the seeded accounts or create your own demo customer.'
                    : 'Create a customer account and get a seeded balance instantly.'}
                </p>
              </div>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  setAuthMode((current) => (current === 'login' ? 'register' : 'login'))
                }
              >
                {authMode === 'login' ? 'Need an account?' : 'Have an account?'}
              </button>
            </div>

            <form
              className="workspace-form"
              onSubmit={(event) => {
                event.preventDefault();
                authMutation.mutate();
              }}
            >
              {authMode === 'register' && (
                <>
                  <div className="field">
                    <label htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      value={authForm.fullName}
                      onChange={(event) =>
                        setAuthForm((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      value={authForm.phone}
                      onChange={(event) =>
                        setAuthForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </div>

              {feedback && <div className="toast">{feedback}</div>}
              {error && <div className="toast error-toast">{error}</div>}

              <button className="button button-primary" type="submit">
                {authMutation.isPending ? 'Please wait...' : authMode === 'login' ? 'Continue to workspace' : 'Create account'}
                <ArrowRight size={18} />
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page workspace-shell">
      <SiteHeader />
      <main className="container" style={{ paddingTop: '1.4rem' }}>
        <div className="toolbar">
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(2.3rem, 4vw, 3.8rem)', letterSpacing: '-0.05em' }}>
              {workspaceTitle}
            </h1>
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              Signed in as {session.user.fullName} · {session.user.roles.join(', ')}
            </p>
          </div>

          <button className="button button-secondary" type="button" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {feedback && <div className="toast" style={{ marginBottom: '1rem' }}>{feedback}</div>}
        {error && <div className="toast error-toast" style={{ marginBottom: '1rem' }}>{error}</div>}

        {dashboard && (
          <section className="metrics-grid">
            {dashboard.mode === 'operations' ? (
              <>
                <div className="metric-tile">
                  <span>Total transactions</span>
                  <strong>{dashboard.totalTransactions}</strong>
                </div>
                <div className="metric-tile">
                  <span>Approval rate</span>
                  <strong>{dashboard.approvalRate}%</strong>
                </div>
                <div className="metric-tile">
                  <span>Flagged traffic</span>
                  <strong>{dashboard.flaggedTransactions}</strong>
                </div>
                <div className="metric-tile">
                  <span>Open alerts</span>
                  <strong>{dashboard.openAlerts}</strong>
                </div>
              </>
            ) : (
              <>
                <div className="metric-tile">
                  <span>Portfolio value</span>
                  <strong>₹{dashboard.portfolioValue.toLocaleString()}</strong>
                </div>
                <div className="metric-tile">
                  <span>Accounts</span>
                  <strong>{dashboard.accounts.length}</strong>
                </div>
                <div className="metric-tile">
                  <span>Recent alerts</span>
                  <strong>{dashboard.alerts.length}</strong>
                </div>
                <div className="metric-tile">
                  <span>Protected by</span>
                  <strong>Hybrid scoring</strong>
                </div>
              </>
            )}
          </section>
        )}

        <section className="workspace-grid">
          <div className="stack">
            <article className="workspace-panel">
              <div className="toolbar">
                <div>
                  <h3>Transaction composer</h3>
                  <p className="muted" style={{ marginTop: '0.35rem' }}>
                    Submit a payment into the real risk pipeline with idempotency,
                    rules, and audit logging.
                  </p>
                </div>
                <Sparkles size={18} color="#00b885" />
              </div>

              <form
                className="workspace-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  transactionMutation.mutate();
                }}
              >
                <div className="grid-two">
                  <div className="field">
                    <label htmlFor="accountId">Account</label>
                    <select
                      id="accountId"
                      value={transactionForm.accountId}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          accountId: event.target.value,
                        }))
                      }
                    >
                      {accountsQuery.data?.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountNumber} · ₹{account.availableBalance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="amount">Amount</label>
                    <input
                      id="amount"
                      type="number"
                      value={transactionForm.amount}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          amount: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid-two">
                  <div className="field">
                    <label htmlFor="merchantName">Merchant</label>
                    <input
                      id="merchantName"
                      value={transactionForm.merchantName}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          merchantName: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="merchantCategory">Category</label>
                    <input
                      id="merchantCategory"
                      value={transactionForm.merchantCategory}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          merchantCategory: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid-two">
                  <div className="field">
                    <label htmlFor="geoLocation">Geo location</label>
                    <input
                      id="geoLocation"
                      value={transactionForm.geoLocation}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          geoLocation: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="deviceFingerprint">Device fingerprint</label>
                    <input
                      id="deviceFingerprint"
                      value={transactionForm.deviceFingerprint}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          deviceFingerprint: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <button className="button button-primary" type="submit">
                  {transactionMutation.isPending ? 'Submitting...' : 'Run risk decision'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </article>

            <article className="workspace-panel">
              <div className="toolbar">
                <div>
                  <h3>Recent activity</h3>
                  <p className="muted" style={{ marginTop: '0.35rem' }}>
                    Latest decisions flowing through the current role view.
                  </p>
                </div>
                <Wallet size={18} color="#00b885" />
              </div>

              <div className="list">
                {(dashboard?.recentTransactions ?? []).map((transaction) => (
                  <div className="list-item" key={transaction.id}>
                    <div className="row">
                      <strong>
                        {'customerName' in transaction
                          ? transaction.customerName
                          : transaction.merchantName ?? 'Merchant'}
                      </strong>
                      <span
                        className={`status-chip status-${
                          transaction.decision ??
                          ('status' in transaction ? transaction.status : 'OPEN')
                        }`}
                      >
                        {transaction.decision ??
                          ('status' in transaction ? transaction.status : 'OPEN')}
                      </span>
                    </div>
                    <p className="muted">
                      ₹{transaction.amount.toLocaleString()} ·{' '}
                      {'merchantName' in transaction
                        ? transaction.merchantName ?? 'Merchant'
                        : 'status' in transaction
                          ? transaction.status
                          : 'Operations activity'}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="stack">
            <article className="workspace-panel">
              <div className="toolbar">
                <div>
                  <h3>Alert queue</h3>
                  <p className="muted" style={{ marginTop: '0.35rem' }}>
                    Review and resolve the latest flagged transactions.
                  </p>
                </div>
                <AlertTriangle size={18} color="#d2664e" />
              </div>

              <div className="list">
                {alertsQuery.data?.map((alert) => (
                  <div className="list-item" key={alert.id}>
                    <div className="row">
                      <strong>{alert.title}</strong>
                      <span className={`status-chip status-${alert.status}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="muted">
                      ₹{alert.transaction.amount.toLocaleString()} · {alert.transaction.merchantName ?? 'Merchant'}
                    </p>
                    {isPrivileged && alert.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        className="button button-secondary"
                        style={{ width: 'fit-content' }}
                        onClick={() => alertMutation.mutate(alert.id)}
                      >
                        Resolve alert
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </article>

            {isPrivileged && (
              <article className="workspace-panel">
                <div className="toolbar">
                  <div>
                    <h3>Active rules</h3>
                    <p className="muted" style={{ marginTop: '0.35rem' }}>
                      Seeded fraud policies currently backing the strategies.
                    </p>
                  </div>
                  <Shield size={18} color="#00b885" />
                </div>

                <div className="list">
                  {rulesQuery.data?.map((rule) => (
                    <div className="list-item" key={rule.id}>
                      <div className="row">
                        <strong>{rule.ruleName}</strong>
                        <span className={`status-chip status-${rule.action}`}>{rule.action}</span>
                      </div>
                      <p className="muted">
                        {rule.ruleType} · priority {rule.priority}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
