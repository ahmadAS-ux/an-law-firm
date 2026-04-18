# A&N LPMS — Roadmap

> **Current Version:** `v0.4.0`
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
