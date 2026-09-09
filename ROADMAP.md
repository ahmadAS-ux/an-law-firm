## Product goal (the "why" — every decision in this prompt serves this)
A&N LPMS must become a **compact, complete law-firm practice system that the firm can run as a live pilot for 3 to 12 months with all of its real users** — the two Partners, System Admin, Department Managers, Employees, Admin Staff and Accountant — managing real clients, cases, matters, tasks, work logs, files and HR reports. After the pilot the firm adopts the product for good and it moves to **Microsoft Azure with Entra ID SSO and Outlook Calendar integration** (v1.0), then Zoho Books (v1.1+).

What "pilot-ready" means for this session and the next two (v0.7.0 → v0.9.0):
- Real people with real data will use staging, so **nothing that leaks data, forges a login, or silently resets settings may remain**. That is why v0.7.0 exists.
- The firm's latest feedback (Task approvals, Partner + Admin Staff only) is a pilot requirement, delivered in v0.9.0 on top of v0.8.0 authorization.
- The pilot runs on Render staging until Azure; the runbook in this prompt is how staging becomes trustworthy enough for that.
- Every user account the firm needs must exist with the correct role by the end of v0.8.0 (seed reference data creates roles now; real user records are created by Ahmad through Settings > Users, never by demo seed).

When a choice in this prompt is ambiguous, pick the option that best serves "real users, real data, 3–12 months, then Microsoft". Ahmad trusts the model's judgement on such choices; record each one under "Assumptions" in `LAST_SESSION.md`.


# A&N LPMS — Roadmap

> **Current Version:** `v0.7.0`
> **Stage:** Phase 1 — Active Development (Staging on Render.com)
> **Next Milestone:** `v1.0.0` = Live on Azure with Microsoft SSO
> **UI Audit Cycle:** v0.4.4 Antigravity audit complete — all 8 confirmed issues fixed in v0.4.5
>
> **v0.5.0 complete** — Schema foundation (departments, roles, permissions, matters, hearings, invoices), DB-driven permissions matrix UI, department management UI, light theme as default, Matters module with approval workflow, decimal billing (0.1h steps), Vitest setup with 20 passing tests.
>
> **v0.6.0–v0.6.2 complete** — Reports module: ReportConfig schema + composite indexes + 3 report permission keys (`viewOwnReports`, `viewDepartmentReports`, `viewAllReports`); Riyadh-tz fixed-offset query library + tagged matter keys + single-query missing-entry fill (v0.6.0). HR Reports stuck in permanent dark mode fixed — CSS variable + Recharts useTheme overhaul (v0.6.2).

---

## Version Naming Rules

| Format | When to use |
|--------|-------------|
| `v0.X.0` | New module or major feature added |
| `v0.X.1` | Bug fix or small tweak |
| `v1.0.0` | Go-live on Azure with real users |
| `v1.X.0` | Post-launch new feature |

**Always use this format when Claude Code asks for a commit/version name:**
`v0.X.0 — [what changed in plain English]`

Examples:
- `v0.3.0 — HR reports module rebuilt`
- `v0.3.1 — fix work log filter bug`
- `v0.4.0 — cases module complete`

---

## Phase 1 — Core Modules (13 Total)

### ✅ Done
- [x] Project setup (Next.js 14, Tailwind, Prisma, shadcn/ui)
- [ ] Pilot authentication — individual credentials required in v0.8.0
- [ ] Pilot authorization — full DB enforcement required in v0.8.0
- [x] Dashboard (basic)
- [x] Clients module
- [x] Cases / Matters module
- [x] Tasks module
- [x] Work Logs module
- [x] Services / Work Types module
- [x] Audit Log module
- [x] Notifications module
- [x] File Management module
- [x] Conflict Check module

### 🔄 In Progress
- [x] HR Reports module — verified complete in v0.4.0 (filters, table, bar chart, export, date fix, bilingual CSV)

### ⏳ Pending
- [ ] Outlook Calendar (Azure phase only — requires Microsoft Graph API)

---

## Phase 2 — After Go-Live

- [ ] Invoicing & Billing module
- [ ] Advanced reporting / analytics
- [ ] Client portal (optional)

---

## ✅ v0.5.0 — Foundation Mega-Session (complete)

| Phase | What shipped |
|-------|-------------|
| Phase 1 | Schema: Department, Role, Permission, RolePermission, Matter, Hearing, BillingRate, Invoice, InvoiceLine, Payment; seed with 6 roles + 26 permissions + Dr. Nawaf permission matrix |
| Phase 2 | DB-driven permissions matrix UI (Settings > Permissions), Department management (Settings > Departments), async `hasPermissionDb`, audit log category field |
| Phase 3 | Light theme as default, theme toggle in header, Matters module + PENDING_APPROVAL→ACTIVE workflow, /api/matters, decimal billing (0.1h), soft-delete on matters |
| Phase 4 | Vitest setup, 20 unit tests (hasPermission, hasPermissionDb, checkApiPermission, requireUser) |

---

## Schema Migrations Required Before Phase 2 — ✅ All complete in v0.5.0

> Migration session target: v0.5.0 (one dedicated session) ← **COMPLETE — see above**
> Estimated time: 2 hours including local testing
> These must land before the Invoicing module can be built.

### 1. Add `Invoice` model
Fields: `id`, `invoiceNumber` (unique), `clientId`, `caseId?`, `issueDate`, `dueDate`, `subtotal` (Float), `vat` (Float), `total` (Float), `currency` (String, default "SAR"), `status` (DRAFT|SENT|PAID|OVERDUE|CANCELLED), `notes`, `notesAr`, `createdById`, `createdAt`, `updatedAt`

### 2. Add `InvoiceLine` model
Fields: `id`, `invoiceId`, `workLogId?` (link to billable work log), `description`, `descriptionAr`, `quantity` (Float), `rate` (Float), `amount` (Float)

### 3. Add `Payment` model
Fields: `id`, `invoiceId`, `amount` (Float), `paidAt` (DateTime), `method` (BANK_TRANSFER|CHECK|CASH|OTHER), `reference`, `notes`

### 4. Add `BillingRate` model
Fields: `id`, `userId?` (rate per lawyer), `workTypeId?` (rate per work type), `hourlyRate` (Float), `currency`, `effectiveFrom`, `effectiveTo?`

### 5. Modify `File` model
Make `caseId` optional, add `clientId?` and `invoiceId?`. Files need to attach to multiple entity types: case files, client KYC docs, invoice PDFs, firm-level templates.

### 6. Add `Hearing` model (required before Phase C Outlook sync)
Fields: `id`, `caseId`, `scheduledAt` (DateTime), `location`, `locationAr`, `hearingType` (String), `outlookEventId?` (String), `notes`, `notesAr`, `createdAt`, `updatedAt`
Reason: cases have multiple hearings; Outlook events sync per-hearing, not per-case.

### 7. Add `@@index` declarations on existing tables
- `AuditLog`: `@@index([userId, createdAt])`
- `WorkLog`: `@@index([userId, date])`, `@@index([caseId])`
- `Notification`: `@@index([userId, isRead])`
- `Case`: `@@index([clientId])`, `@@index([assignedToId, status])`
- `Task`: `@@index([assignedToId, status])`

### 8. Add explicit `onDelete: Restrict` to key relations
- `Case.client` relation
- `Case.assignedTo` relation
- `WorkLog.case` relation
- `WorkLog.client` relation

Reason: Prisma defaults to Restrict, but explicit declaration prevents future accidental cascade deletes that would destroy legal records.

---

## Infrastructure Milestones

| Step | Status |
|------|--------|
| Staging on Render.com | ✅ Live — https://an-law-firm.onrender.com |
| GitHub repo private | ⏳ Before go-live |
| Azure App Service setup | ⏳ Phase 2 |
| Microsoft SSO (Entra ID) | ⏳ Azure phase |
| Outlook Calendar sync | ⏳ Azure phase |
| Production go-live | ⏳ v1.0.0 |

---

## How to Use This File

1. Before starting any session — check what's **In Progress** first
2. After finishing a module — move it from Pending → Done, bump the version
3. Keep this file honest — if something is half-done, say so

## Scheduled milestones

- v0.7.0: safe baseline; ready for implementation review after checks.
- v0.8.0: individual password authentication (or Entra if tenant available), DB authorization on every route, Next.js advisory upgrade, correct real-user accounts, System Admin testing exception default-off.
- v0.9.0: task approvals, Partner/Admin Staff only; rejected tasks final; remove testing exception unless reconfirmed.
- Pilot gate review: all eight gates evidenced, then 3–12 months on Render with real users/data.
- v1.0.0: Azure, Entra SSO/MFA, Outlook/Graph, private Azure Blob downloads through authenticated proxy.
- v1.1+: Zoho Books.

### Pilot entry gates (scheduled across v0.7.0–v0.9.0; NOT expanded into this session)
Real users and real client data may enter staging only when **all** of these are true. Write this list verbatim into `ROADMAP.md` and `SECURITY.md`; v0.7.0 delivers only the items marked (v0.7.0).
1. **Individual authentication** — each person logs in with their own credential mapped to exactly one application user; an Employee cannot obtain a Partner session by changing `userId`. The shared-secret picker in this prompt is for the seed-data period only. Delivered in **v0.8.0** as per-user passwords (bcrypt, admin-set initial password, forced change at first login, lockout after repeated failures) — the bridge until Entra ID; if Entra tenant access arrives earlier, Entra replaces it. Verified by a test that a valid session for user A cannot act as user B.
2. **Authorization enforced from the DB matrix on every route** — v0.8.0.
3. **System Admin testing exception disabled** — before the pilot, not merely "in production". v0.8.0 ships it default-off with an explicit pilot flag; v0.9.0 removes it unless the firm re-confirms.
4. **Next.js advisory closed** (upgrade) — v0.8.0.
5. **Persistent private storage** for uploads on staging (attached disk) — runbook step in v0.7.0, verified before pilot.
6. **Tested restore** — one full database + file restore rehearsal documented with evidence — runbook step in v0.7.0, executed by Ahmad before pilot.
7. **Builds perform no database mutations. Reference seeding preserves editable settings and existing business records, while enforcing explicitly locked policy** — (v0.7.0).
8. **No forgeable or indefinitely reusable sessions; no public file URLs** — (v0.7.0).
