# A&N LPMS — Bug Tracker

> Every bug goes here immediately when found. Nothing gets fixed from memory.

---

## How to Add a Bug

```
### BUG-XXX — [Short title]
- **Found by:** [Who]
- **Date:** YYYY-MM-DD
- **Module:** [e.g. Work Logs]
- **Steps to reproduce:** What to click/do to see the bug
- **Expected:** What should happen
- **Actual:** What happens instead
- **Priority:** Critical / High / Medium / Low
- **Status:** Open / In Progress / Fixed in vX.X.X
```

---

## 🔴 Critical (System broken / data loss risk)

*(None)*

---

## 🟠 High (Feature not working)

*(None)*

---

## 🟡 Medium (Works but wrong)

*(None)*

---

## 🟢 Low (Visual / minor)

*(None)*

---

## ✅ Fixed Bugs (v0.4.5)

### BUG-020 — Add Case form blocked by Base UI Select binding
- **Found by:** v0.4.4 UI/UX staging audit (Antigravity) + Claude Code investigation
- **Date:** 2026-05-03
- **Module:** Cases / Add Case dialog
- **Steps to reproduce:** Open Add Case dialog → select a client → trigger shows raw CUID → form validation fails → no POST sent
- **Expected:** Client name shown in trigger after selection; form submits successfully
- **Actual:** Base UI `SelectPrimitive.Value` falls back to rendering the raw `value` (CUID) when portal unmounts on popup close; client-side `!form.clientId` validation sees empty display and blocks submission
- **Root cause:** `@base-ui/react/select` does not cache item text when portal unmounts; affects all dialogs using the Base UI Select wrapper
- **Fix:** Created `src/components/ui/select-radix.tsx` using `@radix-ui/react-select` (Radix preserves item text internally); updated Add Case dialog to use new component
- **Priority:** Critical
- **Status:** Fixed in v0.4.5

### BUG-021 — Add Task form: Case dropdown shows raw CUID after selection
- **Found by:** v0.4.4 UI/UX staging audit
- **Date:** 2026-05-03
- **Module:** Tasks / Add Task dialog
- **Steps to reproduce:** Open Add Task dialog → select a case → trigger shows raw CUID
- **Root cause:** Same as BUG-020; additionally, mixed JSX children (`<bdi>` + string + title) in SelectItem worsened the fallback behaviour
- **Fix:** Updated Add Task dialog to use `select-radix`; added `textValue` prop to case SelectItem for explicit trigger display text
- **Priority:** High
- **Status:** Fixed in v0.4.5

### BUG-022 — Settings version hardcoded as v0.4.2
- **Found by:** v0.4.4 UI/UX staging audit
- **Date:** 2026-05-03
- **Module:** Settings
- **Steps to reproduce:** Log in as Partner/Admin → Settings → version shows v0.4.2
- **Root cause:** Hardcoded string literal never updated through v0.4.3 and v0.4.4 releases
- **Fix:** Updated `settings/page.tsx` line 65 to `v0.4.5`
- **Priority:** Medium
- **Status:** Fixed in v0.4.5

### BUG-023 — Settings environment label always shows "Production" on staging
- **Found by:** v0.4.4 UI/UX staging audit
- **Date:** 2026-05-03
- **Module:** Settings
- **Root cause:** `process.env.NODE_ENV` is always `"production"` on Render regardless of whether the service is staging or production (Next.js requires it for `npm start`)
- **Fix:** Added `NEXT_PUBLIC_APP_ENV` env var; settings page now reads it (`"production"` shows Production, anything else shows Staging). Ahmad must add `NEXT_PUBLIC_APP_ENV=staging` to Render dashboard env vars manually
- **Priority:** Medium
- **Status:** Fixed in v0.4.5 (requires manual Render env var — see instructions)

### BUG-024 — Employee sees Add Case button despite audit recommendation
- **Found by:** v0.4.4 UI/UX staging audit
- **Date:** 2026-05-03
- **Module:** Cases
- **Root cause:** Permissions matrix has `createClientCase: true` for EMPLOYEE role; button is shown to all roles; audit recommends hiding for Employee
- **Fix:** Button already guarded by `hasPermission` check. Added TODO comment in code pending Ahmad's decision on whether Employee permission matrix should be updated
- **Priority:** Low (flagged for Ahmad review — see session summary)
- **Status:** Fixed in v0.4.5 (partial — permission matrix decision pending)

### BUG-025 — Conflict Check visible to Employee in sidebar
- **Found by:** v0.4.4 UI/UX staging audit
- **Date:** 2026-05-03
- **Module:** Sidebar
- **Steps to reproduce:** Log in as Employee → Conflict Check link visible in sidebar
- **Fix:** Added `guard: "role"` to Conflict Check nav item in `sidebar.tsx`, restricting to PARTNER, ADMIN, MANAGER
- **Priority:** Medium
- **Status:** Fixed in v0.4.5

### BUG-026 — Header search fallback redirects to /clients from all non-scoped pages
- **Found by:** v0.4.4 UI/UX staging audit
- **Date:** 2026-05-03
- **Module:** Header / Global Search
- **Steps to reproduce:** From Dashboard, Settings, Calendar, or any non-cases/tasks/clients page → type in header search → redirected to /clients
- **Root cause:** Unconditional `router.push('/clients?search=...')` fallback in `onSearch`; v0.4.2 fix only scoped three routes
- **Fix:** Added scoping for `/work-logs`, `/files`, `/users`; replaced fallback with early return for pages without search
- **Priority:** High
- **Status:** Fixed in v0.4.5

### BUG-027 — "Hours (7d)" dashboard card label not translated to Arabic
- **Found by:** v0.4.4 UI/UX staging audit
- **Date:** 2026-05-03
- **Module:** Dashboard
- **Steps to reproduce:** Switch UI to Arabic → dashboard shows "Hours (7d)" in English
- **Root cause:** Hardcoded English string in `dashboard/page.tsx`; missing `dashboard.hours7d` i18n key
- **Fix:** Added `dashboard.hours7d` key to `ar.ts` and `en.ts`; updated dashboard to use `t("dashboard.hours7d")`
- **Priority:** Low
- **Status:** Fixed in v0.4.5

---

## ✅ Fixed Bugs

### BUG-017 — Production crash: DropdownMenuLabel/DropdownMenuGroup Base UI error
- **Found by:** Staging deploy verification
- **Date:** 2026-05-01
- **Module:** Header / Profile Menu
- **Steps to reproduce:** Log in as any role → click the user profile avatar in the top-right header
- **Expected:** Profile dropdown opens normally
- **Actual:** Catastrophic client-side exception (Base UI error #31: `useMenuGroupContext()` called outside a `Menu.Group` ancestor), crashing every page
- **Root cause:** Base UI `MenuPrimitive.GroupLabel` calls `useMenuGroupContext()` and throws when rendered without a `Menu.Group` ancestor. `DropdownMenuLabel` was rendered outside `DropdownMenuGroup` in `src/components/layout/header.tsx`
- **Fix:** Wrapped `DropdownMenuLabel` in `DropdownMenuGroup` in `src/components/layout/header.tsx`
- **Lesson:** `npm run dev` hides Base UI context errors — always run `npm run build && npm start` before pushing to staging
- **Priority:** Critical
- **Status:** Fixed in v0.4.3

### BUG-011 — Global search always redirected to Clients page
- **Found by:** UI/UX staging audit
- **Date:** 2026-05-01
- **Module:** Header / Global Search
- **Steps to reproduce:** Go to Cases or Tasks → type in the header search bar → press Enter
- **Expected:** Search stays on current module page
- **Actual:** Always redirected to /clients?search=...
- **Priority:** High
- **Status:** Fixed in v0.4.2 — onSearch now checks pathname prefix before routing

### BUG-012 — Admin Settings page was blank
- **Found by:** UI/UX staging audit
- **Date:** 2026-05-01
- **Module:** Settings
- **Steps to reproduce:** Log in as Admin → click Settings in sidebar
- **Expected:** Firm info, system info, language toggle, M365 section
- **Actual:** Only rendered `<p>الإعدادات</p>`
- **Priority:** High
- **Status:** Fixed in v0.4.2 — full settings page built with 4 sections

### BUG-013 — Missing "Add Case" button
- **Found by:** UI/UX staging audit
- **Date:** 2026-05-01
- **Module:** Cases
- **Steps to reproduce:** Navigate to Cases module as Partner/Admin/Manager
- **Expected:** Gold "إضافة قضية" button at top-right
- **Actual:** No button — no way to create a case from the UI
- **Priority:** High
- **Status:** Fixed in v0.4.2 — button + dialog added, POSTs to /api/cases

### BUG-014 — Missing "Add Task" button
- **Found by:** UI/UX staging audit
- **Date:** 2026-05-01
- **Module:** Tasks
- **Steps to reproduce:** Navigate to Tasks module
- **Expected:** Gold "إضافة مهمة" button
- **Actual:** No button — no way to create a task from the UI
- **Priority:** High
- **Status:** Fixed in v0.4.2 — button + dialog added, POSTs to /api/tasks

### BUG-015 — Missing "Add Work Type" button
- **Found by:** UI/UX staging audit
- **Date:** 2026-05-01
- **Module:** Services / Work Types
- **Steps to reproduce:** Log in as Admin → navigate to Work Types
- **Expected:** Gold "إضافة نوع عمل" button
- **Actual:** No button — no way to create a work type from the UI
- **Priority:** Medium
- **Status:** Fixed in v0.4.2 — button + dialog added, POSTs to /api/work-types

### BUG-016 — Conflict Check shows stale results during a new search
- **Found by:** Code review (UI/UX audit follow-up)
- **Date:** 2026-05-01
- **Module:** Conflict Check
- **Steps to reproduce:** Search for term A → see results → immediately search for term B → previous results remain visible during fetch
- **Expected:** Previous results cleared immediately; spinner shown; "No conflicts found" if empty
- **Actual:** Stale results remain until new fetch completes, making it appear the search returned nothing
- **Priority:** Medium
- **Status:** Fixed in v0.4.2 — rows cleared before fetch, loading spinner added, no-results message added

### BUG-008 — HR Reports `to` date filter excludes same-day logs
- **Found by:** Claude Code verification (staging review)
- **Date:** 2026-04-18
- **Module:** HR Reports API
- **Steps to reproduce:** Set date range ending today — logs entered today may not appear
- **Expected:** All logs on the final date included
- **Actual:** `lte: new Date(to)` resolves to midnight, cutting off same-day logs
- **Priority:** Medium
- **Status:** Fixed in v0.4.0 — changed to `setHours(23, 59, 59, 999)`

### BUG-009 — `/api/reports` missing `force-dynamic`, risk of prerender cache
- **Found by:** Claude Code verification
- **Date:** 2026-04-18
- **Module:** HR Reports API
- **Steps to reproduce:** Run `next build` — route may be prerendered and return stale/empty data
- **Expected:** Route always runs server-side against live DB
- **Actual:** Missing `export const dynamic = 'force-dynamic'`
- **Priority:** High
- **Status:** Fixed in v0.4.0 — added directive to top of route file

### BUG-010 — CSV export headers always English regardless of UI language
- **Found by:** Claude Code verification
- **Date:** 2026-04-18
- **Module:** HR Reports (client)
- **Steps to reproduce:** Switch UI to Arabic, export CSV — headers are still English
- **Expected:** Arabic column headers when lang is 'ar'
- **Actual:** Hardcoded English headers in all cases
- **Priority:** Low
- **Status:** Fixed in v0.4.0 — headers now conditional on lang parameter

### BUG-004 — Case opening date not shown in Cases table
- **Found by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Cases
- **Steps to reproduce:** Open Cases module — no date column visible
- **Expected:** "Date Opened" column displaying case createdAt as DD/MM/YYYY
- **Actual:** Column missing entirely
- **Priority:** Medium
- **Status:** Fixed in v0.3.1

### BUG-005 — Column header misalignment in Cases table
- **Found by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Cases
- **Steps to reproduce:** Open Cases table — headers not aligned above their data columns
- **Expected:** Each header directly above its column
- **Actual:** Headers and data misaligned
- **Priority:** Low
- **Status:** Fixed in v0.3.1 — added colgroup with explicit column widths

### BUG-006 — Case number search returns no results
- **Found by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Cases
- **Steps to reproduce:** Search for case number e.g. "AN-2026-0001" — no result on PostgreSQL
- **Expected:** Matching case returned
- **Actual:** No results — contains() is case-sensitive on PostgreSQL
- **Priority:** High
- **Status:** Fixed in v0.3.1 — search.toUpperCase() applied to caseNumber contains query

### BUG-007 — Client name not shown next to tasks in Tasks list
- **Found by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Tasks
- **Steps to reproduce:** Open Tasks list — no client name visible per task
- **Expected:** Client name shown in its own column
- **Actual:** Column missing — case relation did not include client
- **Priority:** Medium
- **Status:** Fixed in v0.3.1 — tasks API updated to include case.client; column added to UI

### BUG-001 — Next.js prerendering DB-hitting API route
- **Found by:** Ahmad
- **Date:** 2025
- **Module:** API / Build
- **Fix:** Added `export const dynamic = 'force-dynamic'` to affected routes
- **Status:** Fixed in v0.1.x

### BUG-002 — Render.com ignoring render.yaml build commands
- **Found by:** Ahmad
- **Date:** 2025
- **Module:** Deployment
- **Fix:** Dashboard overrides yaml — always verify both match
- **Status:** Fixed — documented in ROADMAP

### BUG-003 — Missing prisma db push in build sequence
- **Found by:** Ahmad
- **Date:** 2025
- **Module:** Deployment
- **Fix:** Build script: `prisma generate → prisma db push → tsx seed.ts → next build`
- **Status:** Fixed

---

## Rules

- Never fix a bug without logging it here first
- Bump the patch version when fixing: `v0.3.0 → v0.3.1`
- Move to Fixed section with the version it was resolved in
