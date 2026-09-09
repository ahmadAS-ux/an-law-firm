## Product goal (the "why" — every decision in this prompt serves this)
A&N LPMS must become a **compact, complete law-firm practice system that the firm can run as a live pilot for 3 to 12 months with all of its real users** — the two Partners, System Admin, Department Managers, Employees, Admin Staff and Accountant — managing real clients, cases, matters, tasks, work logs, files and HR reports. After the pilot the firm adopts the product for good and it moves to **Microsoft Azure with Entra ID SSO and Outlook Calendar integration** (v1.0), then Zoho Books (v1.1+).

What "pilot-ready" means for this session and the next two (v0.7.0 → v0.9.0):
- Real people with real data will use staging, so **nothing that leaks data, forges a login, or silently resets settings may remain**. That is why v0.7.0 exists.
- The firm's latest feedback (Task approvals, Partner + Admin Staff only) is a pilot requirement, delivered in v0.9.0 on top of v0.8.0 authorization.
- The pilot runs on Render staging until Azure; the runbook in this prompt is how staging becomes trustworthy enough for that.
- Every user account the firm needs must exist with the correct role by the end of v0.8.0 (seed reference data creates roles now; real user records are created by Ahmad through Settings > Users, never by demo seed).

When a choice in this prompt is ambiguous, pick the option that best serves "real users, real data, 3–12 months, then Microsoft". Ahmad trusts the model's judgement on such choices; record each one under "Assumptions" in `LAST_SESSION.md`.


# A&N Law Firm — LPMS (Claude Code Context)

## Project location

- Application root: **`an-law-firm/`** inside this `Sand` folder.
- All implementation work targets `an-law-firm/` unless noted.

## Workspace boundary

- Work only under **`C:\Users\Administrator\Documents\CLAUDE\A&N law firm\Sand`**
- Do not read or write paths outside this folder.

---

## 📁 Project Files — Read These First

| File | What it is |
|------|-----------|
| `ROADMAP.md` | Current version, module status, what to build next |
| `BUGFIX.md` | Active bugs — check before starting any work |
| `ENHANCEMENTS.md` | Feedback and improvement requests |
| `UIUX.md` | All design rules, brand colors, component standards |
| `SECURITY.md` | Security checklist and rules — never bypass |

**At the start of every session:** read `ROADMAP.md` and `BUGFIX.md` first.
**After finishing work:** update `ROADMAP.md` status and bump the version.

---

## Version & Commit Rules

**Always use this format for commits and version names:**
`v0.X.0 — what changed in plain English`

Full version naming table: see **ROADMAP.md → Version Naming Rules**.

**Never ask the user what to name the version — use the format above and continue.**

---

## Stack

- **Next.js 14** (App Router, TypeScript, `src/`)
- **Tailwind CSS** + **tailwindcss-rtl**
- **Brand colors:** near-black `#1A1A1A`, heritage-gold `#B8963E`, warm-gray `#3D3D3D`
- **Fonts:** Tajawal (Arabic), DM Sans (English body), Cormorant Garamond (English headings)
- **Default UI direction:** RTL / `lang="ar"`
- **Prisma** + PostgreSQL in every environment
- **shadcn/ui** (Slate, CSS variables)
- **Auth (dev):** HTTP-only cookie `an-auth` — use `getCurrentUser()` / `useAuth()` only
- **Auth (production):** Microsoft SSO / Entra ID
- **Roles (v0.5.0+):** 6 roles: PARTNER, SYSTEM_ADMIN, DEPARTMENT_MANAGER, EMPLOYEE, ADMIN_STAFF, ACCOUNTANT. Legacy 4-role string kept for backward compat — use `roleId` for new code.
- **Permissions (v0.5.0+):** Database-driven via Role/Permission/RolePermission tables. Use `hasPermissionDb()` for new code. Legacy `hasPermission(role, perm)` still works. Settings > Permissions provides UI matrix editor.
- **Default theme:** Light (`#FAFAFA` background). Dark theme available via toggle in header.

---

## Product Rules

- **Bilingual:** Arabic + English strings in `src/i18n/ar.ts` and `src/i18n/en.ts`
- **BiDi:** English fragments inside Arabic UI MUST be wrapped in `<bdi dir="ltr">`
- **Permissions:** Enforce on BOTH client (hide UI) and server (API returns 403)
  - Use server helpers from `src/lib/permissions.server.ts`; legacy matrix removal is scheduled for v0.8.0
- **Audit:** Mutating actions must create `AuditLog` rows where spec requires it
- **Security:** Never skip auth checks, never log secrets, never commit `.env`

---

## Workflow

1. Read `ROADMAP.md` — confirm what module/task is next
2. Read `BUGFIX.md` — check if any open bugs affect this work
3. Read `UIUX.md` — apply correct brand and component standards
4. Implement in small reviewable steps — match existing patterns
5. After each phase: run `npm run dev`, smoke-test, commit with version name
6. Update `ROADMAP.md` to reflect new status
7. Update ENHANCEMENTS.md — mark any user-reported items as Done
8. Update `CHANGELOG.md` — add an entry for the version just shipped
9. Check SECURITY.md — confirm no permission or auth rules are affected before any Prisma query change
---

## Coding Conventions

- **Imports:** Use `@/` alias (`@/components/...`, `@/lib/...`)
- **Server data:** Route handlers use Prisma from `@/lib/prisma` singleton
- **UI:** shadcn components; RTL-aware layouts (`dir`, `text-start`, logical CSS properties)
- **Forms:** Validate on server; show bilingual errors via i18n keys
- **IDs:** Prisma `cuid()` where schema defines it

**Agent reminders:**
- Tag `prisma/schema.prisma` when adding features that touch data
- Tag `src/lib/permissions.ts` when adding routes or pages that need RBAC
- New strings go in `src/i18n/ar.ts` and `src/i18n/en.ts` — no hardcoded literals in components

---

## Autonomous Execution

- Prefer defaults and continue without asking, unless blocked
- **Never ask for a version name** — generate it using the format above
- Never ask "should I continue?" — continue unless something is broken or missing

---

## Windows Path Note (`A&N` in folder name)

- `npm` / `npx` may break on paths containing `&`
- Use **package.json scripts** — run `npm run dev` from `an-law-firm/` folder
- Never use raw `npx prisma` — use `npm run` equivalents

## Build Sequence (production / Render)

```
prisma generate → next build (build only); npm run release is the separate migration/reference step
```

> ⚠️ `render.yaml` is overridden by the Render dashboard. Any build command change must be made in BOTH `render.yaml` (for docs) AND the Render dashboard (for actual effect). The Render dashboard is the source of truth.

## Pre-Push Verification

Always run before pushing:
1. `npm run build` — must pass with zero TypeScript errors
2. `npm start` — must boot cleanly (test for 5–10 seconds, then CTRL+C)

`npm run dev` hides certain runtime errors (especially Base UI context errors). Only `npm start` catches them.

## Required Environment Variables

```
DATABASE_URL
NODE_ENV
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_ENV     # "staging" or "production" — controls the label in Settings page
                        # Must be set via Render dashboard (NOT in committed files)
                        # Render sets NODE_ENV=production for all builds, so this is the only way to distinguish environments
```

---

## Key Files

| Area | Location |
|------|----------|
| Schema | `prisma/schema.prisma` |
| Seed | `prisma/seed.ts` |
| Auth | `src/lib/auth.ts`, `src/middleware.ts` |
| Permissions | `src/lib/permissions.ts`, `src/lib/api-permissions.ts` |
| i18n | `src/i18n/ar.ts`, `src/i18n/en.ts` |

## End of Session — Always Do This Last

After committing, output a short Session Summary in this format:

---
SESSION SUMMARY — v0.3.1
Date: YYYY-MM-DD
What was done: [plain English, 2-3 lines]
Files changed: [list]
Decisions made: [any new patterns or choices]
Next session should start with: [what's next]
---

After outputting the summary in chat, also write the exact same content to
`LAST_SESSION.md` at the repo root (`an-law-firm/LAST_SESSION.md`),
overwriting the previous file each time.


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
