# Changelog

All notable changes to A&N LPMS.
Format follows [Keep a Changelog](https://keepachangelog.com).

---

## [v0.6.2] — 2026-05-13

### Fixed
- HR Reports page stuck in permanent dark mode: replaced 23+ hardcoded hex colours with CSS-variable Tailwind classes (`bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-muted`) and fixed 6 Recharts inline style props to read theme via `useTheme()` / `isDark` conditional

---

## [v0.6.0] — 2026-05-13

### Added
- Reports module phase 1: `ReportConfig` schema singleton, composite indexes on report-related tables, 3 report permission keys (`viewOwnReports`, `viewDepartmentReports`, `viewAllReports`)
- Reports module phase 2: Riyadh fixed-offset timezone query library, tagged matter keys, single-query strategy for filling missing date entries

---

## [v0.5.1] — 2026-05-09

### Fixed
- Excluded `vitest.config.ts` and `vitest.setup.ts` from Next.js TypeScript build (`tsconfig.json` paths tightened) to prevent tsc errors leaking into the production build

---

## [v0.5.0] — 2026-05-09

### Added
- Schema: `Department`, `Role`, `Permission`, `RolePermission`, `Matter`, `Hearing`, `BillingRate`, `Invoice`, `InvoiceLine`, `Payment` models; seed with 6 roles + 26 permissions + Dr. Nawaf permission matrix
- DB-driven permissions matrix UI (Settings > Permissions)
- Department management UI (Settings > Departments)
- Light theme as default; theme toggle in header; dark theme preserved via `next-themes`
- Matters module with `PENDING_APPROVAL → ACTIVE` approval workflow; `/api/matters`; soft-delete
- Decimal billing: 0.1-hour increments; `BillingRate` model per-lawyer and per-work-type
- Vitest setup with 20 unit tests (`hasPermission`, `hasPermissionDb`, `checkApiPermission`, `requireUser`)

### Changed
- Auth refactored: async `hasPermissionDb()` for database-driven permission checks; legacy `hasPermission()` still works for backward compat
- Roles expanded to 6: `PARTNER`, `SYSTEM_ADMIN`, `DEPARTMENT_MANAGER`, `EMPLOYEE`, `ADMIN_STAFF`, `ACCOUNTANT`

---

## [v0.4.6] — 2026-05-03

### Fixed
- Login picker showing raw CUID instead of user name
- Header search input placeholder polish

---

## [v0.4.5] — 2026-05-03

### Fixed
- Add Case form blocked: Base UI Select shows raw CUID on portal unmount — migrated to Radix Select wrapper (BUG-020)
- Add Task form: Case dropdown shows raw CUID after selection — Radix fix + `textValue` prop (BUG-021)
- Settings version hardcoded as v0.4.2 — updated to v0.4.5 (BUG-022)
- Settings environment label always showed "Production" on staging — added `NEXT_PUBLIC_APP_ENV` env var (BUG-023)
- Employee role could see Add Case button — `createClientCase` set to `false` for `EMPLOYEE` (BUG-024)
- Conflict Check visible to Employee in sidebar — restricted to `PARTNER`, `ADMIN`, `MANAGER` (BUG-025)
- Header search fallback redirected to `/clients` from all non-scoped pages (BUG-026)
- Dashboard "Hours (7d)" label not translated to Arabic — added `dashboard.hours7d` i18n key (BUG-027)

---

## [v0.4.3] — 2026-05-01

### Fixed
- Production crash on every page after v0.4.2 deploy: Base UI error #31 caused by `DropdownMenuLabel` without `DropdownMenuGroup` wrapper in `header.tsx` (BUG-017)

---

## [v0.4.2] — 2026-05-01

### Added
- Settings page: firm info, system info, language toggle, Microsoft 365 placeholder (BUG-012)
- Add Case button + dialog — POSTs to `/api/cases` (BUG-013)
- Add Task button + dialog — POSTs to `/api/tasks` (BUG-014)
- Add Work Type button + dialog — POSTs to `/api/work-types` (BUG-015)

### Fixed
- Global header search no longer always redirects to Clients — scoped to current module (BUG-011)
- Conflict Check clears stale results immediately, shows loading spinner, shows no-results message (BUG-016)

---

## [v0.4.0] — 2026-04-18

### Added
- HR Reports module: date filters, data table, bar chart, CSV export

### Fixed
- HR Reports `to` date filter now includes same-day logs via `setHours(23, 59, 59, 999)` (BUG-008)
- `/api/reports` uses `force-dynamic` to prevent stale prerender caching (BUG-009)
- CSV export headers now respect Arabic UI language (BUG-010)

---

## [v0.3.1] — 2026-04-18

### Fixed
- Cases table missing Date Opened column — `createdAt` added as DD/MM/YYYY (BUG-004)
- Cases table column header alignment fixed with explicit colgroup widths (BUG-005)
- Case number search returned no results on PostgreSQL — fixed with `.toUpperCase()` on contains query (BUG-006)
- Tasks list now shows client name per task — case relation updated to include client (BUG-007)

---

## [v0.1.x] — 2025

### Fixed
- Next.js prerendering DB-hitting API routes — added `export const dynamic = 'force-dynamic'` (BUG-001)
- Render.com ignoring `render.yaml` — dashboard overrides yaml; documented as source of truth (BUG-002)
- Missing `prisma db push` in build sequence — added to deployment script (BUG-003)
