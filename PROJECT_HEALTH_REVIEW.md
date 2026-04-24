# Project Health Review — A&N LPMS

> Use this document to audit the system against real-world workflows before go-live.
> Run a full review at the end of each Phase.

---

## Part A — Real Workflow Validation

### A1: Workflow Coverage

Does the system support what the team actually does every day?

#### Real Workflow Validation

| Question | How to verify | Status |
|----------|---------------|--------|
| Can a lawyer open a new case end-to-end without help? | Shadow a real lawyer doing it for the first time | |
| Can the admin find any case in under 10 seconds? | Search by client name, case number, and lawyer name | |
| Can work logs be submitted on mobile? | Open the app on a phone and submit a log | |
| Does the conflict check surface actual conflicts? | Add a client who has a real conflict and check the result | |
| Can HR pull a monthly report in under 2 minutes? | Time the full flow: login → HR Reports → export | |
| Does every notification reach the right person? | Trigger each notification type and confirm delivery | |
| Does every piece of data know who it belongs to? For each data type: where does it come from? (Orgadata / manual / external), where is it stored?, is it linked to the correct entity? (lead / project / request), what happens if it arrives without a linked entity? | Walk through each data type with the factory manager. For each one, open the DB and confirm the foreign key exists. If any data type has no parent link → that is a critical gap. | |

---

## Part B — Permission & Security Audit

### B1: Access Control

| Question | How to verify | Status |
|----------|---------------|--------|
| Can a lawyer see another lawyer's private cases? | Log in as Lawyer A, try to view Lawyer B's restricted cases | |
| Can a non-admin create or delete users? | Log in as a lawyer and attempt user management actions | |
| Can an unauthenticated user reach any API route? | Call API routes directly without a session cookie | |
| Are audit logs created for all mutations? | Perform create/update/delete actions and inspect audit_log table | |

---

## Part C — Data Integrity Audit

### C1: Orphan & Integrity Checks

| Question | How to verify | Status |
|----------|---------------|--------|
| Are there any tasks with no case? | `SELECT * FROM task WHERE caseId IS NULL` | |
| Are there any work logs with no user? | `SELECT * FROM work_log WHERE userId IS NULL` | |
| Are there any files with no linked entity? | `SELECT * FROM file WHERE caseId IS NULL AND taskId IS NULL` | |
| Are all case numbers unique? | `SELECT caseNumber, COUNT(*) FROM case GROUP BY caseNumber HAVING COUNT(*) > 1` | |

---

## Part D — Issue Log

> Issues found during health reviews are logged here before being moved to BUGFIX.md.

### Current Issues

### Issue #4: Glass/Panel order not linked to ERP project or customer
**Found in:** Post-Phase 1 architecture review
**Severity:** Critical
**Category:** Business gap / Architecture
**Description:** When a DOCX file is uploaded via the legacy QR system (Home.tsx / POST /api/qr/process), the resulting processed_docs record has no project_id or lead_id. It is impossible to know which ERP customer or project the glass order belongs to.
**Impact:** Glass orders are floating in the system with no customer or project link. Admin cannot trace which delivery belongs to which customer. QR codes generated have no ERP context.
**Root cause:** Layer 1

---

### Resolved Issues

*(None yet)*
