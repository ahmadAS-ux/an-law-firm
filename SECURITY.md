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
- [ ] 🟠 NEXTAUTH_SECRET is a strong random string (not default/example value)
- [ ] 🟠 Node.js version pinned (`engines` in package.json)
- [ ] 🟡 Dependency audit run: `npm audit` before go-live
- [ ] 🟡 Rate limiting on API routes (prevent abuse)

---

## Known Security Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2025 | Cookie-based auth for local dev | Simplify development, replaced with SSO in prod |
| 2025 | Microsoft Entra ID for production SSO | Already in firm's Microsoft ecosystem |
| 2025 | Permissions enforced client + server | Client-only = bypassable; server-only = bad UX |
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
