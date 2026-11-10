export type ActiveRole =
  | 'citizen'
  | 'ward_desk'
  | 'officer'
  | 'supervisor'
  | 'admin'
  | 'researcher'
  | 'auditor';

export type WorkspaceTab =
  | 'home'
  | 'intake'
  | 'track'
  | 'services'
  | 'my_cases'
  | 'about_help'
  | 'officer'
  | 'supervisor'
  | 'admin'
  | 'research';

export interface PlatformSnapshot {
  users: any[];
  roles: any[];
  wards: any[];
  departments: any[];
  assets: any[];
  responsibilityRules: any[];
  slaRules: any[];
  services: any[];
  governmentDocuments: any[];
  cases: any[];
  caseTasks: any[];
  caseEvents: any[];
  evidence: any[];
  routingReviews: any[];
  duplicateCandidates: any[];
  feedbackAppeals: any[];
  notifications: any[];
  auditLogs: any[];
  integrationLogs: any[];
  researchEvaluations: any[];
  lastSyncedAt: string;
  imageVersions?: Record<string, string>;
}
