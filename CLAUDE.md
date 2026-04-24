# A&N Law Firm — LPMS (Claude Code Context)

## Project location

- Application root: **`an-law-firm/`** inside this `Sand` folder.
- All implementation work targets `an-law-firm/` unless noted.

## Workspace boundary

- Work only under **`C:\Users\Administrator\Documents\Clouda`**
- Do not read or write paths outside Clouda.

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

| Format | When |
|--------|------|
| `v0.X.0` | New module or feature |
| `v0.X.1` | Bug fix or small tweak |
| `v1.0.0` | Go-live on Azure |

**Never ask the user what to name the version — use the format above and continue.**

---

## Stack

- **Next.js 14** (App Router, TypeScript, `src/`)
- **Tailwind CSS** + **tailwindcss-rtl**
- **Brand colors:** near-black `#1A1A1A`, heritage-gold `#B8963E`, warm-gray `#3D3D3D`
- **Fonts:** Tajawal (Arabic), DM Sans (English body), Cormorant Garamond (English headings)
- **Default UI direction:** RTL / `lang="ar"`
- **Prisma** + SQLite locally; PostgreSQL on Render/Azure for production
- **shadcn/ui** (Slate, CSS variables)
- **Auth (dev):** HTTP-only cookie `an-auth` — use `getCurrentUser()` / `useAuth()` only
- **Auth (production):** Microsoft SSO / Entra ID

---

## Product Rules

- **Bilingual:** Arabic + English strings in `src/i18n/ar.ts` and `src/i18n/en.ts`
- **BiDi:** English fragments inside Arabic UI MUST be wrapped in `<bdi dir="ltr">`
- **Permissions:** Enforce on BOTH client (hide UI) and server (API returns 403)
  - Use `hasPermission` / `checkApiPermission` from `src/lib/permissions.ts`
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
8. Check SECURITY.md — confirm no permission or auth rules are affected before any Prisma query change
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
prisma generate → prisma db push → tsx seed.ts → next build
```

## Required Environment Variables

```
DATABASE_URL
NODE_ENV
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_TELEMETRY_DISABLED=1
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