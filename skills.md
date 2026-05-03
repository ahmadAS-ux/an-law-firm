# A&N Law Firm LPMS — Skills & Conventions

This file summarizes how to extend and maintain the app. Detailed execution steps live in the implementation plan (phases 1–13 + deploy).

## Phase checklist

| Phase | Focus |
|-------|--------|
| 1 | Next.js scaffold, shadcn, folders, Tailwind/fonts, `.env` |
| 2 | Prisma schema (SQLite), seed data |
| 3 | Dummy login (cookie + APIs + middleware) |
| 4 | RBAC, guards, users admin API |
| 5–8 | Clients, Cases, Tasks, Work logs |
| 9–11 | Work types, Files, HR reports |
| 12 | Audit log, conflict check, notifications |
| 13 | Dashboard, shell, calendar, i18n polish |
| Deploy | PostgreSQL, `render.yaml`, health route |

## Coding conventions

- **Imports:** Use `@/` alias (`@/components/...`, `@/lib/...`).
- **Server data:** Route handlers use Prisma from `@/lib/prisma` singleton.
- **UI:** shadcn components; RTL-aware layouts (`dir`, `text-start`, logical properties).
- **Forms:** Validate on server; show bilingual errors via i18n keys.
- **IDs:** Prisma `cuid()` where schema defines it.

## Agent-oriented tips

- Tag **`@prisma/schema.prisma`** when adding features that touch data.
- Tag **`@src/lib/permissions.ts`** when adding routes or pages that need RBAC.
- Keep new strings out of hardcoded scattered literals — add keys to **`ar.ts` / `en.ts`**.

## Optional: Cursor user skills

For reusable editor workflows (PR babysitting, rules, settings), see Cursor’s skill docs under `~/.cursor/skills-cursor/` if installed; this repo does not duplicate those files.
