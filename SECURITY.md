# A&N LPMS — Security Checklist & Log

> Legal systems handle confidential client data.
> Every item here must be reviewed before go-live.

---

## Security Levels

| Level | Meaning |
|-------|---------|
| 🔴 Critical | Must be fixed before any real user touches the system |
| 🟠 High | Must be fixed before go-live |
| 🟡 Medium | Fix within first month of go-live |
| 🟢 Low | Nice to have, schedule when possible |

---

## Pre-Launch Checklist

### Authentication & Access
- [ ] 🔴 Switch from cookie dev auth to Microsoft SSO (Entra ID) before go-live
- [ ] 🔴 All routes protected by middleware — unauthenticated users redirected to login
- [ ] 🔴 Role-based permissions enforced on BOTH client (hide UI) and server (API 403)
- [ ] 🔴 No hardcoded credentials anywhere in codebase
- [ ] 🟠 Session timeout configured (auto logout after inactivity)
- [ ] 🟠 GitHub repo set to private before go-live

### Data Protection
- [ ] 🔴 `.env` file never committed to GitHub (check `.gitignore`)
- [ ] 🔴 `DATABASE_URL` and secrets only in environment variables, never in code
- [ ] 🟠 PostgreSQL database not publicly accessible — only App Service can connect
- [ ] 🟠 All API inputs validated and sanitized (no raw user input to DB)
- [ ] 🟡 Database backups enabled on Azure / Render

### Audit & Monitoring
- [ ] 🟠 Audit Log capturing all mutating actions (create, update, delete)
- [ ] 🟠 Audit Log is append-only — no delete/edit of log entries
- [ ] 🟡 Failed login attempts logged
- [ ] 🟡 Azure monitoring / alerts configured post-launch

### Conflict of Interest
- [ ] 🟠 Conflict Check module operational before real client data entered
- [ ] 🟠 Conflict check runs on new client creation automatically

### Infrastructure
- [ ] 🔴 HTTPS only — no HTTP in production
> **Render Dashboard Override:** `render.yaml` exists in repo but is silently overridden by Render dashboard settings. Build commands and plan are managed in the Render web UI, not the yaml file. The yaml is kept for documentation purposes only.
- [ ] 🟠 NEXTAUTH_SECRET is a strong random string (not default/example value)
- [ ] 🟠 Node.js version pinned (`engines` in package.json)
- [ ] 🟡 Dependency audit run: `npm audit` before go-live
- [ ] 🟡 Rate limiting on API routes (prevent abuse)

---

## Database-Driven Permissions (v0.5.0+)

As of v0.5.0, permissions are stored in the database (Role, Permission, RolePermission tables) and editable from Settings > Permissions.

| Rule | Detail |
|------|--------|
| Modified Dr. Nawaf model | PARTNER: all permissions locked ON. SYSTEM_ADMIN: technical permissions locked, matter permissions editable. Other roles: fully editable. |
| Locked permissions | `isLocked=true` on RolePermission — these rows are rejected with 400 by the matrix PATCH API. Cannot be changed via UI. |
| Audit capture | All permission changes write to AuditLog (category: "permissions") with before/after diff. |
| Glass-break model | NOT implemented in v0.5.0 — deferred to v0.6.0. |
| Legacy sync matrix | `hasPermission(role, permission)` remains for backward compat with 40+ existing callers. Will be removed in v0.6.0 when roleId migration completes. |
| `hasPermissionDb` | New async function for new code. Checks DB RolePermission with scope awareness (ALL / OWN_DEPARTMENT / OWN / PARTIAL). |

---

## Permissions Matrix Decisions

| Decision | Reasoning |
|----------|-----------|
| PARTNER has `manageUsers: true` | Owner override — partners must be able to add/remove staff without going through admin |
| PARTNER has `systemSettings: true` | Owner override — firm-level settings are the partners' responsibility |
| PARTNER has `viewAuditLog: true` | Legal oversight requirement |
| ADMIN has `manageUsers` + `systemSettings` + `viewAuditLog` | Day-to-day operational owner — same powers as partner for these |
| MANAGER `assignToTeam: true`, `assignToAnyone: false` | Managers can delegate within their team, not across the whole firm |
| ~~EMPLOYEE `createClientCase: true`~~ → now `false` | **Reversed 2026-05-03** — UI/UX audit recommendation: case creation is a Partner/Admin/Manager responsibility; Employees are read-only on cases |
| EMPLOYEE `viewAllClients: false` | Employees only see clients they were assigned to or created |

---

## Known Security Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2025 | Cookie-based auth for local dev | Simplify development, replaced with SSO in prod |
| 2025 | Microsoft Entra ID for production SSO | Already in firm's Microsoft ecosystem |
| 2025 | Permissions enforced client + server | Client-only = bypassable; server-only = bad UX |
| 2026-05-03 | `createClientCase` restricted to PARTNER/ADMIN/MANAGER | Reverses v0.4.4 EMPLOYEE intake decision based on UI/UX audit recommendation — case creation is a senior-role responsibility |
| 2025 | Audit Log on all mutations | Legal requirement — track who changed what |

---

## Sensitive Data Inventory

| Data Type | Where stored | Who can access |
|-----------|-------------|----------------|
| Client personal info | PostgreSQL — Clients table | Partner, Admin, Manager |
| Case details | PostgreSQL — Cases table | Partner, Admin, Manager, assigned Employee |
| Work logs / billing | PostgreSQL — WorkLog table | Partner, Admin, Manager |
| Staff HR data | PostgreSQL — HR tables | Partner, Admin only |
| System audit trail | PostgreSQL — AuditLog table | Partner, Admin only |
| Auth credentials | Microsoft Entra ID (production) | Not stored in our DB |

---

## Incident Log

> If anything goes wrong security-wise, log it here.

| Date | Incident | Action taken | Resolved |
|------|----------|-------------|---------|
| *(none yet)* | | | |

---

## Rules for Claude Code

- Never output or log secrets, tokens, or passwords
- Never disable auth middleware "temporarily"
- Never skip server-side permission checks even if client already hides the UI
- Never commit `.env` or any file containing real credentials
- Flag any code that stores passwords in plain text — always use hashed/Microsoft SSO

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


## v0.7.0 controls and open items

- Signed expiring session tokens use Web Crypto HMAC. Middleware verifies signatures/expiry; server handlers reload users and reject inactive/soft-deleted identities. Missing/short signing secrets fail closed.
- Seed-data picker is off by default and requires a shared test secret; Basic auth independently covers staging paths. Shared-secret login is NOT individual pilot authentication.
- File bytes are private; authenticated downloads enforce the same read policy as metadata. Delete authority remains manageFiles. Legacy public URLs are denied even if source files remain. Soft-delete retains bytes for future controlled purge.
- Scoped DB grants deny missing ownership/department context; server-only module prevents Prisma imports into client hooks. Legacy route checks remain scheduled for v0.8.0: see docs/AUTHZ_INVENTORY.md.
- Reference seed preserves editable choices and existing assignments; only explicitly locked Partner/System Admin policy is reasserted. Policy resets require a valid actor and atomically record before/after history. Demo provenance is explicit; protected incoming references prevent cleanup and audited demo users are retained inactive.
- Next.js remains 14.2.15 by explicit scope. The official December 2025 advisory identified 14.2.35 as its 14.x fix; current full audit findings are in docs/dependency-review-2026-09.md. Upgrade/review in v0.8.0 is mandatory before real client data enters an exposed environment.
- Ahmad explicitly accepts v0.7.0 staging auto-deploy while staging contains seed data only. This does not satisfy pilot entry or implementation review.
- System Admin selector exception is DOCUMENTED ONLY in v0.7.0; v0.8.0 default-off; must be disabled before real users/data enter the pilot. App TOTP is dropped; Entra supplies MFA at SSO.
- Part A is user-confirmed. Persistent storage configuration, staging reconciliation, real backup restore evidence and implementation review remain manual gates.

## v0.7.0 runtime settings

| Variable | Purpose |
|---|---|
| DATABASE_URL | PostgreSQL connection, supplied privately |
| NEXTAUTH_SECRET | Signing secret, at least 32 UTF-8 bytes |
| DEV_LOGIN_PICKER_ENABLED | Explicit true for seed-data tests only; unset before pilot |
| DEV_LOGIN_SECRET | Shared test secret, never client configuration or stored in browser |
| STAGING_BASIC_AUTH | user:password for the independent staging boundary |
| UPLOAD_DIR | Private persistent storage root; default .uploads is local-only |
| ALLOW_DEMO_SEED | Explicit true for disposable databases only; unset on production/shared staging |
| CONFIRM_POLICY_RESET | Explicit yes for intentional admin reset; unset normally |
| POLICY_RESET_ACTOR | Active non-deleted Partner/System Admin user id for audited reset |
| NEXT_PUBLIC_APP_ENV | Presentation label only, never authentication |

Build: npm ci && npm run build. Reference seed: npm run db:seed:reference. Release after baselining: npm run release. Paid Render pre-deploy availability and mounted disk must be verified by Ahmad; dashboard command changes are manual. See docs/MIGRATION_BASELINE.md.
