# Changelog

All notable changes to A&N LPMS.
Format follows [Keep a Changelog](https://keepachangelog.com).

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
