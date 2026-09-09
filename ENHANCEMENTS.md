# A&N LPMS — Enhancements & Feedback Log

> Log every piece of feedback here first. Do NOT act on it immediately.
> Review this file at the start of each new module to decide what to schedule.

---

## How to Add an Enhancement

Copy this template and paste at the top of the relevant section:

```
### [Short title]
- **Reported by:** [Partner / Admin / Ahmad / Self]
- **Date:** YYYY-MM-DD
- **Module:** [e.g. Work Logs]
- **Description:** What they said or what you noticed
- **Priority:** High / Medium / Low
- **Status:** Pending / Scheduled for vX.X / Done
```

---

## 🔴 High Priority

### i18n coverage gaps (audit findings)
- **Reported by:** Documentation audit
- **Date:** 2026-05-02
- **Module:** Global / multiple modules
- **Description:** Translation keys missing for several modules:
    - Audit Log: only title key exists, no body content
    - Notifications: only title, no notification type labels
    - Files: only title, no upload/version/preview keys
    - Users: only title, no role labels in user list context
    - No common validation keys (required, invalid email, min length, phone format)
    - No common toast keys (saved, deleted, error, loading)
- **Priority:** High (blocks Gate 5 and new Gate 12)
- **Status:** Open — unverified; re-audit in v0.8.0

---

## 🟡 Medium Priority

*(None logged yet)*

---

## 🟢 Low Priority / Nice to Have

*(None logged yet)*

---

## ✅ Completed Enhancements

### v0.4.5 UI/UX audit fixes — May 2026 — completed
- **Reported by:** Antigravity staging audit (v0.4.4 cycle)
- **Date:** 2026-05-03
- **Module:** Global (Add Case, Add Task, Header, Settings, Sidebar, Dashboard)
- **Description:** 8 confirmed bugs fixed: Base UI Select replaced with Radix in dialogs (fixes Add Case/Task creation + CUID display), header search fallback fixed, settings version bumped to v0.4.5, environment label decoupled from NODE_ENV, Conflict Check hidden from Employee sidebar, Hours (7d) translated to Arabic
- **Status:** Done in v0.4.5

### UI/UX audit fixes from staging review
- **Reported by:** Automated staging audit (Antigravity)
- **Date:** 2026-05-01
- **Module:** Global (header, settings, cases, tasks, services, conflict-check)
- **Description:** 6 confirmed bugs fixed: scoped header search, settings page built out, Add Case / Add Task / Add Work Type buttons added with dialogs, conflict check loading state added
- **Status:** Done in v0.4.2

### HR Reports module — verified and gaps patched
- **Reported by:** Claude Code verification (staging review)
- **Date:** 2026-04-18
- **Module:** HR Reports
- **Description:** Module confirmed feature-complete. Three gaps patched: date filter end-of-day fix, force-dynamic directive, bilingual CSV headers
- **Status:** Done in v0.4.0

### Cases table — Date Opened column
- **Reported by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Cases
- **Description:** User requested createdAt date visible in cases table
- **Status:** Done in v0.3.1

### Cases table — Column header alignment
- **Reported by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Cases
- **Description:** Headers not aligned above their columns in RTL table
- **Status:** Done in v0.3.1

### Cases — Case number search not working on staging (PostgreSQL)
- **Reported by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Cases
- **Description:** Search by case number returned no results on PostgreSQL due to case sensitivity
- **Status:** Done in v0.3.1

### Tasks list — Show client name per task
- **Reported by:** User (staging review)
- **Date:** 2026-04-18
- **Module:** Tasks
- **Description:** User wanted to see which client each task belongs to without opening the task
- **Status:** Done in v0.3.1

---

## Notes

- High priority = blocking real work or partner request
- Medium = improves daily use, schedule within 2 modules
- Low = polish, do after go-live

### Task Management – Required Changes
- **Reported by:** Partner
- **Date:** 2026-09-09
- **Priority:** High
- **Status:** Scheduled for v0.9.0
- **Client feedback verbatim:**

> **Task Management – Required Changes**
>
> **1. Task Creation**
> - All users should be able to create a new task.
> - Every newly created task must have the status "Pending Approval."
> - The task must be approved by either: Partner, or Admin Staff.
> - After approval, the task becomes active.
>
> **2. Task Description**
> - Increase the size of the Description field in the Add Task form.
> - Use a larger multi-line text box so users can easily enter and read longer descriptions.
>
> **3. Task Status** — the following statuses should be available: Pending Approval · To Do · In Progress · Completed · Rejected
>
> **4. Editing Existing Tasks**
> - Users should be able to propose changes to an existing task, including: Description, Due date/time, Responsible person, Priority, Status.
> - Any edit made by a regular user must be submitted for Partner/Admin Staff approval.
> - The existing approved information should remain unchanged until the edit is approved.
> - Once approved, the new information replaces the previous information.
> - Partner/Admin Staff should be able to Approve or Reject the requested changes.
>
> **5. Approval & Audit** — the system should record: Created by · Approved/rejected by · Approval/rejection date · Requested changes · Previous values · New values
>
> **Important:** Approval permissions must be restricted to Partner and Admin Staff only, while all users can create tasks and submit edit requests.
