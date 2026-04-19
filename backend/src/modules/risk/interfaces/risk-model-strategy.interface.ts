export interface RiskBehaviorSnapshot {
  txCount24h: number;
  avgTxAmount30d: number;
  commonGeo?: string | null;
  trustedDevices: string[];
}

export interface FraudRuleSnapshot {
  id: string;
  ruleName: string;
  ruleType: string;
  priority: number;
  action: 'APPROVE' | 'HOLD' | 'BLOCK';
  conditionJson: Record<string, unknown>;
}

export interface RiskAssessmentInput {
  amount: number;
  merchantCategory?: string;
  geoLocation?: string;
  deviceFingerprint?: string;
  behavior: RiskBehaviorSnapshot;
  rules: FraudRuleSnapshot[];
}

export interface RiskSignal {
  signalType: string;
  signalKey: string;
  signalValue: number;
  weight: number;
  triggered: boolean;
}

export interface RiskAssessmentResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decision: 'APPROVE' | 'HOLD' | 'BLOCK';
  reasonCodes: string[];
  modelConfidence: number;
  signals: RiskSignal[];
  strategy: 'RULE_ONLY' | 'HYBRID';
}

export interface RiskModelStrategy {
  readonly name: 'RULE_ONLY' | 'HYBRID';
  evaluate(input: RiskAssessmentInput): RiskAssessmentResult;
}
