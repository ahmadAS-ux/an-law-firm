# Project Health Review — A&N LPMS

> **Purpose:** One-time audit before v1.0.0 go-live.
> **Who runs this:** Ahmad (solo).
> **Time needed:** ~2 hours.
> **How:** Walk through each check in the live staging or Azure environment — no coding required.
> **Reference:** Cross-check `SECURITY.md`, `ROADMAP.md`, and `BUGFIX.md` as you go.

---

## How to Use This File

1. Work through each Part in order — A, B, C, D.
2. For each check: mark the Status column as ✅ Pass, ❌ Fail, or ⚠️ Partial.
3. Any ❌ or ⚠️ becomes an Issue in Part E before go-live.
4. Do not mark v1.0.0 ready until every Critical check is ✅.

---

## Part A — Real Workflow Validation

> Does the system support what lawyers and staff actually do every day?

### A1: Core Lawyer Workflow

| # | Check | How to verify | Status |
|---|-------|---------------|--------|
| A1.1 | Can a lawyer log in using their Microsoft account? | Open the login page, click Microsoft SSO, complete login | |
| A1.2 | Can a lawyer open a new case from start to finish without help? | Create a new case with client, type, assigned lawyer, and hearing date — time the process | |
| A1.3 | Can a lawyer see only their own assigned cases (if restricted)? | Log in as a lawyer and check the Cases list | |
| A1.4 | Can a lawyer add a task to a case and assign it to another lawyer? | Open a case, add a task, assign to someone else | |
| A1.5 | Can the assigned lawyer see the task on their Tasks page? | Log in as the assigned person, check Tasks | |

### A2: Admin & Partner Workflow

| # | Check | How to verify | Status |
|---|-------|---------------|--------|
| A2.1 | Can admin find any case in under 10 seconds? | Search by client name, case number, and lawyer name | |
| A2.2 | Can admin create a new client and run conflict check? | Add a new client and confirm conflict check runs automatically | |
| A2.3 | Can a partner see the full dashboard including HR Reports? | Log in as a partner — all modules visible | |
| A2.4 | Can partner pull a monthly HR report in under 2 minutes? | Time the full flow: login → HR Reports → filter → export | |
| A2.5 | Can admin reassign a task from one lawyer to another? | Reassign a task and verify notification sent to both | |

### A3: Work Logs & Billing Readiness

| # | Check | How to verify | Status |
|---|-------|---------------|--------|
| A3.1 | Can a lawyer submit a work log in under 30 seconds? | Time the flow: client → case → work type → hours → save | |
| A3.2 | Does the client dropdown show all their assigned clients? | Open work log form, check dropdown | |
| A3.3 | Does the case dropdown filter correctly based on selected client? | Pick a client, confirm only their cases appear | |
| A3.4 | Are billable vs non-billable hours clearly separated? | Submit both types, check the HR Reports output | |
| A3.5 | Can the work log be edited after submission (by lawyer or admin)? | Try editing your own log, then try editing someone else's as admin | |

### A4: Mobile Usability

| # | Check | How to verify | Status |
|---|-------|---------------|--------|
| A4.1 | Does the login page work on mobile? | Open the staging URL on a phone and log in | |
| A4.2 | Can a work log be submitted on mobile in under 45 seconds? | Open the app on phone and submit a log | |
| A4.3 | Is the Arabic RTL layout correct on mobile? | Check all main pages on phone in Arabic mode | |
| A4.4 | Do tables remain readable on narrow screens? | Open Cases and Tasks tables on mobile | |

---

## Part B — Permission & Security Audit

> Cross-reference with `SECURITY.md` checklist.

### B1: Access Control

| # | Check | How to verify | Status |
|---|-------|---------------|--------|
| B1.1 | Can a lawyer see another lawyer's restricted cases? | Log in as Lawyer A, try to open Lawyer B's private case URL directly | |
| B1.2 | Can a non-admin create or delete users? | Log in as a lawyer, attempt to add/delete a user from the Users page | |
| B1.3 | Can a non-admin view HR Reports? | Log in as a lawyer, try to open the HR Reports page | |
| B1.4 | Can an unauthenticated user reach any page? | Open an incognito browser, try to access /cases directly — should redirect to login | |
| B1.5 | Does the Employee role see only what they should? | Log in as Employee, verify they see only their tasks and work logs | |

### B2: Audit Trail Integrity

| # | Check | How to verify | Status |
|---|-------|---------------|--------|
| B2.1 | Is an audit log created when a case is created? | Create a case, then check the Audit Log page | |
| B2.2 | Is an audit log created when a case is updated? | Edit a case, check the Audit Log page | |
| B2.3 | Is an audit log created when a case is deleted? | Delete a test case, check the Audit Log page | |
| B2.4 | Can audit log entries be deleted or edited by anyone? | Try to delete an audit log entry — should be impossible (append-only) | |
| B2.5 | Is the user who performed each action recorded? | Check that every audit entry shows who did what and when | |

### B3: Sensitive Data Protection

| # | Check | How to verify | Status |
|---|-------|---------------|--------|
| B3.1 | Are passwords ever visible in the system? | Confirm no password field exists — Microsoft SSO only | |
| B3.2 | Are API routes exposed without authentication? | Open any /api/ route directly in the browser — should return 401 | |
| B3.3 | Is HTTPS enforced on production? | Open the production URL with http:// — should auto-redirect to https:// | |
| B3.4 | Is the `.env` file excluded from git? | Check `.gitignore` contains `.env` | |

---

## Part C — Data Integrity Audit

> Plain-English walkthrough — no database queries needed. Use the app's own UI to verify.

### C1: Orphan Checks

| # | Check | How to verify (in the UI) | Status |
|---|-------|---------------------------|--------|
| C1.1 | Every task belongs to a case | Open Tasks list — confirm every row shows a case name, none are blank | |
| C1.2 | Every work log belongs to an employee and a client | Open Work Logs list — confirm every row shows both employee and client | |
| C1.3 | Every file is attached to a case | Open Files page — confirm every file has a case link | |
| C1.4 | Every case has an assigned lawyer | Open Cases list — confirm assigned lawyer column is filled for all | |
| C1.5 | Every client has at least one field filled (name, contact, etc.) | Open Clients list — no row should have only blank fields | |

### C2: Uniqueness Checks

| # | Check | How to verify (in the UI) | Status |
|---|-------|---------------------------|--------|
| C2.1 | No duplicate case numbers | Try to create a new case with an existing case number — should fail with clear error | |
| C2.2 | No duplicate client records (same name + contact) | Try to create a client with the same name as an existing one — check if warning appears | |
| C2.3 | No duplicate user emails | Try to create a user with an existing email — should fail | |

### C3: Data Flow Consistency

| # | Check | How to verify | Status |
|---|-------|---------------------------|--------|
| C3.1 | Closing a case does not delete its tasks or work logs | Close a case, confirm tasks/logs still visible (just marked under closed case) | |
| C3.2 | Deleting a client is blocked if they have active cases | Try to delete a client with cases — should show error | |
| C3.3 | Changing a lawyer's role does not delete their past work logs | Change a user's role — their historical logs must still appear | |
| C3.4 | Reassigning a case keeps all its history intact | Reassign a case, confirm audit log shows both old and new assignee | |

---

## Part D — Notifications & Conflict Checks

### D1: Notifications Coverage

| # | Check | How to verify | Status |
|---|-------|---------------------------|--------|
| D1.1 | New case assignment triggers notification to assignee | Assign a case, log in as assignee, check Notifications | |
| D1.2 | Task assignment triggers notification | Assign a task, verify notification appears | |
| D1.3 | Task reassignment notifies both old and new assignee | Reassign a task, verify both get notifications | |
| D1.4 | Case status change triggers notification | Change a case from Active → Closed, verify relevant parties notified | |
| D1.5 | Hearing date reminders appear in Notifications | Set a hearing date 1 day away, verify reminder | |

### D2: Conflict Check

| # | Check | How to verify | Status |
|---|-------|---------------------------|--------|
| D2.1 | Conflict check runs automatically when a new client is created | Add a client with a name matching an existing one — warning should appear | |
| D2.2 | Conflict check surfaces real conflicts (partner/opposing side) | Add a client who is on the opposite side of an existing case — verify flagged | |
| D2.3 | Conflict check does not block legitimate clients | Add a clearly unrelated client — should pass with no warnings | |

---

## Part E — Issue Log

> Issues found during this health review are logged here before being moved to `BUGFIX.md`.

### Current Issues

*(None — add during audit)*

### Template for Logging

```
### Issue #X: [Short title]
**Found in:** Part [A/B/C/D], check #
**Severity:** Critical / High / Medium / Low
**Description:** What was found
**Impact:** What breaks or is at risk because of this
**Next step:** Move to BUGFIX.md as BUG-XXX or fix immediately
```

---

### Resolved Issues

*(None yet)*

---

## Go-Live Sign-Off

**LPMS is ready for v1.0.0 go-live when:**

- [ ] Every check in Part A is ✅
- [ ] Every check in Part B is ✅ (no exceptions — these are security-critical)
- [ ] Every check in Part C is ✅
- [ ] Every check in Part D is ✅
- [ ] All issues in Part E are resolved or documented in `BUGFIX.md` with an accepted workaround
- [ ] `SECURITY.md` pre-launch checklist is fully green
- [ ] Microsoft SSO tested by at least 2 staff accounts in production

**Signed off by:** Ahmad (Consultant/Developer) — Date: ________
**Approved by:** Dr. Nawaf Al-Sheikh — Date: ________
