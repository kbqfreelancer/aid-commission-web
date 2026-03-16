// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'data_entry' | 'supervisor' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organisation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Organisation ─────────────────────────────────────────────────────────────
export interface Organisation {
  _id: string;
  name: string;
  region: string;
  district: string;
  contactPerson?: string;
  contactEmail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Indicators ───────────────────────────────────────────────────────────────
export type BreakdownType = 'age_only' | 'age_sex' | 'violation_sex' | 'category_sex';

export interface BreakdownDefinition {
  type: BreakdownType;
  field: string;
  label: string;
  keys?: string[];
  sexKeys?: string[];
  ageKeys?: string[];
  violationKeys?: string[];
  categoryKeys?: string[];
}

export interface IndicatorDefinition {
  id: string;
  number: string;
  label: string;
  breakdowns: BreakdownDefinition[];
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type ReportStatus = 'draft' | 'submitted' | 'verified' | 'rejected';

export interface HrReport {
  _id: string;
  organisation: Organisation | string;
  reportingYear: number;
  reportingQuarter: Quarter;
  reportingMonth?: number;
  submissionDate?: string;
  submittedBy: User | string;
  verifiedBy?: User | string;
  status: ReportStatus;
  data: Record<string, Record<string, unknown>>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API response envelope ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─── Aggregation / Summary ────────────────────────────────────────────────────
export interface OrgSummaryRow {
  organisation: Organisation;
  reportCount: number;
  indicators: Record<string, unknown>;
  totals: Record<string, number>;
}

export interface NationalSummary {
  year: number;
  quarter: string;
  reportCount: number;
  organisationCount: number;
  indicators: Record<string, unknown>;
}

// ─── Query params (Swagger-aligned) ───────────────────────────────────────────
export interface OrganisationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  isActive?: boolean;
}

export interface IndicatorQueryParams {
  page?: number;
  limit?: number;
  id?: string;
}

export interface ReportQueryParams {
  year?: number;
  quarter?: string;
  organisation?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SummaryByOrgQueryParams {
  year: number;
  quarter?: string;
  organisation?: string;
  page?: number;
  limit?: number;
}

export interface SummaryQueryParams {
  year: number;
  quarter?: string;
}

export interface AuditLogQueryParams {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export type AdminConfigKey =
  | 'age-bands'
  | 'sexes'
  | 'violation-types'
  | 'roles'
  | 'quarters'
  | 'report-statuses'
  | 'status-transitions'
  | 'required-current-status';

// ─── Forms ────────────────────────────────────────────────────────────────────
export interface LoginForm { email: string; password: string; }
export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organisation?: string;
}
export interface ReportForm {
  organisation: string;
  reportingYear: number;
  reportingQuarter: Quarter;
  reportingMonth?: number;
  notes?: string;
  data: Record<string, Record<string, unknown>>;
}
