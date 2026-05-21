# A&N LPMS — UI/UX Functional Review (Live Staging)

> Audited: 2026-05-01
> Environment: https://an-law-firm.onrender.com
> Auditor: Antigravity (automated)
> Last updated: 2026-05-02 — resolution statuses added after v0.4.2/v0.4.3 fixes

## Executive Summary
The A&N LPMS staging environment demonstrates functional routing, baseline bilingual support, and correct foundational role-based access control (RBAC). The major v0.4.2 and v0.4.3 patches resolved the critical blockers (crash, missing buttons, broken search, blank settings). Remaining open issues are scoped to v0.5.x work.

---

## Critical Issues

| # | Issue | Resolution Status |
|---|-------|-------------------|
| 1 | Profile Menu Application Crash | ✅ **Fixed in v0.4.3** — `DropdownMenuLabel` wrapped in `DropdownMenuGroup` (BUG-017) |
| 2 | External Domain Leakage (qr-asset-manager-web.onrender.com) | ⚠️ **INVESTIGATE** — see note below |
| 3 | Broken Global Search Navigation | ✅ **Fixed in v0.4.2** — search scoped to current module (BUG-011) |
| 4 | Blank Admin Settings Page | ✅ **Fixed in v0.4.2** — full settings page built with 4 sections (BUG-012) |

### Note on External Domain Leakage (Issue #2)
A grep of the entire `src/` codebase (2026-05-02) found **zero matches** for `qr-asset-manager`, `asset-manager-web`, or any hardcoded `onrender.com` URLs. The staging build appears clean. The issue may have been resolved as part of a prior deploy or was environment-variable-based. **Mark for re-test on next staging deploy** — if the issue reappears, add BUG-018 and trace to the Render env vars dashboard.

---

## High Priority Issues

| # | Issue | Resolution Status |
|---|-------|-------------------|
| 1 | Missing Core Entity Creation Buttons (Cases, Tasks, Work Types) | ✅ **Fixed in v0.4.2** — Add buttons + dialogs added for all three (BUG-013, BUG-014, BUG-015) |
| 2 | Incomplete Client Data Validation (nameless client saved) | 🔴 **Still Open** — scheduled for v0.5.0 |
| 3 | Mobile Layout Failure at 375px | 🔴 **Still Open** — scheduled for v0.5.x |

---

## Medium Priority Issues

| # | Issue | Resolution Status |
|---|-------|-------------------|
| 1 | Database IDs Displayed in Work Logs Form | 🟡 **Still Open** — scheduled for v0.5.0 |
| 2 | Audit Log Failure to Record Mutations | 🟡 **Still Open** — write-path investigation needed in v0.5.0 |
| 3 | Manager Dashboard Metrics Stuck (skeleton) | 🟡 **Still Open** — data fetching investigation needed |
| 4 | Inconsistent Conflict Check Loading (double-submit) | ✅ **Fixed in v0.4.2** — cleared on new search, loading spinner added (BUG-016) |

---

## Low Priority / Polish

| # | Issue | Resolution Status |
|---|-------|-------------------|
| 1 | False Positive Notification Badges | 🟢 **Still Open** — badge decoupled from data; scheduled for v0.5.x |
| 2 | Calendar Module Placeholder | 🟢 **Still Open** — placeholder by design (Azure Phase C) |

---

## Findings by Role

### Partner Workflow Findings
The Partner role successfully bypasses basic RBAC restrictions, viewing all modules. Case and Task creation now work (buttons added in v0.4.2). Profile menu crash resolved in v0.4.3.

### Admin Workflow Findings
The Admin successfully accesses the Users & Permissions module. Settings page is now functional (v0.4.2). Role-change persistence should be re-tested in the next staging review.

### Manager Workflow Findings
The Manager role has the correct module visibility, but suffers from broken dashboard data fetching (stuck skeletons). Conflict checking now works reliably on first search (v0.4.2 fix).

### Employee Workflow Findings
Permissions are tightly and correctly enforced. The Employee sees only their assigned cases and tasks. Navigation to restricted routes is successfully blocked.

---

## Findings by Module

| Module | Status |
|--------|--------|
| Clients | Creation works; name validation still missing |
| Cases / Matters | Add Case button restored (v0.4.2) |
| Tasks | Add Task button restored (v0.4.2) |
| Work Logs | Works; dropdowns still show raw DB IDs |
| HR Reports | Filters correct; CSV export domain leak needs re-test |
| Notifications | Badge decoupled from data |
| File Management | Accessible; limited testing |
| Conflict Check | Fixed — consistent loading on first search (v0.4.2) |
| Audit Log | Non-functional write-path |
| Users & Permissions | Role switching works; persistence needs re-test |
| Dashboard | Profile menu crash resolved (v0.4.3); Manager skeleton still stuck |
| Settings | Full page restored (v0.4.2) |

---

## Bilingual / RTL Findings
The UI toggle successfully switches the layout from LTR to RTL. Translations of primary navigation labels are accurate. RTL layout breaks at mobile viewports — tracked as Still Open above.

---

## Sign-Off Readiness
**PARTIAL** — major v0.4.2/v0.4.3 blockers fixed. Remaining issues are scoped to v0.5.x: mobile responsive layout, audit log write-path, work log dropdown labels, dashboard data fetching.

**Full sign-off blocked on:** client name validation, mobile layout, audit log write-path, work log dropdown labels, Manager dashboard metrics.
