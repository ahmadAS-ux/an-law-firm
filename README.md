# A&N Law Firm — Legal Practice Management System
## عبدالله العامري ود.نواف آل الشيخ للمحاماة والاستشارات القانونية

Internal LPMS for A&N Law Firm — a boutique advocacy firm in Riyadh. Bilingual Arabic-RTL / English. Manages clients, cases, tasks, work logs, files, HR reporting, audit trail, and conflict checks.

**Status:** Phase 1 — Active Development (Staging on Render.com)
**Current version:** v0.4.4
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
4. `npm run db:push` to sync schema
5. `npm run db:seed` to seed initial data
6. `npm run dev` — opens at http://localhost:3000
7. Pick any seeded user from the login screen

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
| UI_UX_REVIEW.md | Pre-go-live audit (will archive after v1.0.0) |
| PROJECT_HEALTH_REVIEW.md | Go-live sign-off checklist |
| LAST_SESSION.md | Most recent session summary |

## Deploy

Use the `/deploy` slash command in Claude Code. See `Deploy.md`.

## License

Proprietary — A&N Law Firm. Internal use only.
