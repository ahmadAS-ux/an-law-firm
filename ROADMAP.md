# A&N LPMS — Roadmap

> **Current Version:** `v0.4.3`
> **Stage:** Phase 1 — Active Development (Staging on Render.com)
> **Next Milestone:** `v1.0.0` = Live on Azure with Microsoft SSO

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
- [ ] Project setup (Next.js 14, Tailwind, Prisma, shadcn/ui)
- [ ] Auth (cookie-based dev login, route protection)
- [ ] Users & Permissions module
- [ ] Dashboard (basic)
- [ ] Clients module
- [ ] Cases / Matters module
- [ ] Tasks module
- [ ] Work Logs module
- [ ] Services / Work Types module
- [ ] Audit Log module
- [ ] Notifications module
- [ ] File Management module
- [ ] Conflict Check module

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

## Schema Migrations Required Before Phase 2

> Migration session target: v0.5.0 (one dedicated session)
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
