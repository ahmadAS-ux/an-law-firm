export type ReportScope = "OWN" | "DEPARTMENT" | "ALL";

export type ReportPeriodPreset =
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "yearToDate"
  | "custom";

export interface ReportPeriod {
  preset: ReportPeriodPreset;
  /** Riyadh calendar date string YYYY-MM-DD — inclusive start */
  from: string;
  /** Riyadh calendar date string YYYY-MM-DD — inclusive end */
  to: string;
  label: string;
  labelAr: string;
}

export interface MetricResult {
  value: number | null;
  formatted: string;
  unit: string;
  drilldownAvailable: boolean;
  /** Optional context data (e.g., target attainment) */
  context?: Record<string, unknown>;
}

export interface ReportFilters {
  userId?: string;
  departmentId?: string;
  matterType?: "case" | "matter" | "both";
  billable?: boolean;
}

export interface ReportConfig {
  workweekDays: number[];
  standardHoursPerDay: number;
  targetHoursPartner: number;
  targetHoursManager: number;
  targetHoursEmployee: number;
  targetHoursAdminStaff: number;
  targetHoursAccountant: number;
  lateEntryThresholdDays: number;
}

/** Resolved permission snapshot for the current user */
export interface PermissionSnapshot {
  granted: Set<string>;
  scopes: Map<string, string>;
}

/** User context passed into report functions */
export interface ReportUser {
  id: string;
  departmentId: string | null;
  roleName: string;
  permissions: PermissionSnapshot;
}
