# A&N Law Firm — Legal Practice Management System
## عبدالله العامري ود.نواف آل الشيخ للمحاماة والاستشارات القانونية

Internal LPMS for A&N Law Firm — a boutique advocacy firm in Riyadh. Bilingual Arabic-RTL / English. Manages clients, cases, tasks, work logs, files, HR reporting, audit trail, and conflict checks.

**Status:** Phase 1 — Active Development (Staging on Render.com)
**Current version:** v0.7.0
**Staging:** https://an-law-firm.onrender.com

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + tailwindcss-rtl + shadcn/ui (Base UI) |
| Database | PostgreSQL via Prisma ORM |
| Auth (dev) | Cookie session / user-picker |
| Auth (prod target) | Microsoft SSO / Entra ID |
| Charts | Recharts |
| Staging | Render.com (Starter plan) |
| Production target | Microsoft Azure App Service |

## Local Development

1. `git clone` and open in VS Code
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. `npm run db:migrate` on an empty local DB; existing DBs follow docs/MIGRATION_BASELINE.md
5. `npm run db:seed:reference` for reference data; explicit disposable demo seed only
6. `npm run dev` — opens at http://localhost:3000
7. For seed-data tests only, explicitly enable the picker and enter the separately configured test secret

## Documentation

| File | Purpose |
|------|---------|
| CLAUDE.md | Entry point for Claude Code sessions |
| ROADMAP.md | Module status, current version, what's next |
| BUGFIX.md | Active and resolved bugs |
| ENHANCEMENTS.md | Feedback and improvement requests |
| CHANGELOG.md | Version history |
| UIUX.md | Brand identity and component standards |
| SECURITY.md | Security checklist and rules |
| QUALITY_GATES.md | Pre-merge quality checks |
| AZURE.md | Phase A/B/C migration plan |
| archive/UI_UX_REVIEW_v0.4.4.md | Pre-go-live UI/UX audit, v0.4.4 snapshot (archived) |
| PROJECT_HEALTH_REVIEW.md | Go-live sign-off checklist |
| LAST_SESSION.md | Most recent session summary |

## Deploy

Use the `/deploy` slash command in Claude Code. See `.claude/commands/deploy.md`.

## License

Proprietary — A&N Law Firm. Internal use only.


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
