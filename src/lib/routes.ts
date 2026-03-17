export const ROUTES = {
  dashboard: '/dashboard',
  reports: '/dashboard/reports',
  reportsNew: '/dashboard/reports/new',
  report: (id: string) => `/dashboard/reports/${id}`,
  reportEdit: (id: string) => `/dashboard/reports/${id}/edit`,
  organisations: '/dashboard/organisations',
  indicators: '/dashboard/indicators',
  indicatorsNew: '/dashboard/indicators/new',
  admin: '/dashboard/admin',
  auditLogs: '/dashboard/admin/audit-logs',
  auditLog: (id: string) => `/dashboard/admin/audit-logs/${id}`,
} as const;
