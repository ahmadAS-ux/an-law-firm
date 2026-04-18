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

## ✅ Fixed Bugs

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
