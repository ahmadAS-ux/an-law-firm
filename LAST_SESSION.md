# Session — v0.7.0 safe baseline

Date: 2026-09-09

## Part A — do this BEFORE the v0.7.0 auto-deploy

Completed according to Ahmad's explicit `PART A BACKUP DONE: yes` confirmation and docs/backups/PART_A_2026-09.md. This satisfies the push prerequisite. The dump filename/size and uploads checksum-manifest filename were not supplied; record those identifiers in the backup record. Backup contents and successful restore have not been independently verified here.

## Work completed

- Prompt review: completed within 15 minutes; execution-blocking factual corrections only, recorded in docs/prompt-review-v0.7.0.md and applied to prompts/v0.7.0-safe-baseline.md. Windows npm lifecycle and explicit Prisma generation corrections were added when execution exposed them.
- Phase 0: preserved eight original report/guard source files in commit 29bf2e2; original tracked changes were absent. Preserved the original schema snapshot. Screened requested artifacts; ignored local tooling/test storage. Existing stash and tracked .claude workflow remain untouched. With/without project diagnostics are in docs/untracked-inventory-2026-09.md.
- Phase 1: original baseline passed TypeScript, lint and 20 tests. Dependency audit recorded without upgrading Next.js.
- Phase 2: reference-only compatibility seed, injected seed functions, editable-policy preservation, explicit audited resets, demo provenance and relationship-aware cleanup. Audited demo users remain inactive with audit history intact. Verified with fake-client tests and real local PostgreSQL.
- Phase 3: original-schema 0_init plus idempotent additions migration; mutation-free repository builds, guarded local db push, release script and manual three-part reconciliation runbook. Both migrations applied to a new local database; additions replay and schema comparison passed.
- Phase 4: server-only DB permission helpers, missing-context denial, locked-matrix rejection/audit and complete API authorization inventory. Existing route authorization migration remains v0.8.0.
- Phase 5: signed 12-hour sessions, active-user checks, shared safe client DTO, opt-in secret-protected picker, localized UI and Basic auth across dotted assets/API paths.
- Phase 6: private upload keys, authenticated downloads, separate read/delete policy, soft deletion, unconditional legacy URL denial and resumable checksummed migration script. The migration script was written but not run against operator files or databases.
- Phase 7: product goal, eight pilot gates, version sequence, Task Management feedback, environment documentation and open security decisions reflected in the required documents.
- Phase 8: final verification passed. Main commit and origin/main push are authorized by the confirmed Part-A prerequisite; commit/push outcome is reported in the task response.

## Verification evidence

All logs are under docs/verification/. After clean installation with the process-local PowerShell lifecycle shell, explicit Prisma generation preceded final TypeScript checking.

| Check | Result |
|---|---|
| npm ci with Windows lifecycle correction | PASS |
| TypeScript | PASS |
| ESLint | PASS, no warnings/errors |
| Vitest | PASS, 52 tests across 6 files |
| Production build, DATABASE_URL on unreachable loopback port 1 and auth credentials cleared | PASS |
| Fresh local PostgreSQL migrations + reference seed | PASS |
| Repeated additions migration + updated-schema diff | PASS, no difference |
| Local production HTTP/DB integration harness | PASS, all 15 grouped checks |
| Preserved-source with/without isolated project diagnostics | All-present PASS; omitting guard produces six expected missing-import errors; individual route omissions compile |

The isolated build proves a reachable database is unnecessary to build; it does not prove no connection was attempted. PostgreSQL 18.4 on 127.0.0.1:55437 was the disposable integration environment. All mutation commands explicitly targeted that local database. No remote database commands, Render setting changes, .env edits or user-file deletion occurred. Local test files remain ignored.

Failures and warnings, including the cmd.exe A&N postinstall failure, missing generated Prisma types, initial mock issues and harmless webpack cache warning, are recorded in BUGFIX.md and docs/verification/resolved-failures.md with available full logs. Dependency replacement invalidated the first isolated inventory attempts; the final post-generation results supersede them.

## Remaining manual gates and locations

No implementation phase is blocked. These operator/reviewer gates are still open and are not release sign-off:

- docs/MIGRATION_BASELINE.md:15 — Part B real pre-change dump comparison, unmanaged-object inspection, already-updated rehearsal and full database/file restore evidence. Synthetic clean-install evidence is complete.
- docs/MIGRATION_BASELINE.md:21 — Part C staging schema agreement before resolving both migrations; verify actual dashboard command and paid plan, persistent disk, secrets, file migration and checksum verification; then switch dashboard build/release commands.
- SECURITY.md:147 — Next.js 14.2.15 audit/advisory remains open by explicit scope. Close in v0.8.0 before real client data enters any internet-reachable environment. Ahmad accepts this push's staging auto-deploy only while staging contains seed data.
- SECURITY.md:149 — System Admin selector testing exception is documented only; default-off implementation in v0.8.0 and disabled before pilot.
- docs/AUTHZ_INVENTORY.md:1 — legacy/auth-only route authorization remains for v0.8.0 DB-backed enforcement.
- This file's Antigravity checklist — visual/staging checks and separate implementation review remain outstanding. Pilot entry requires evidence for all eight gates.

## Assumptions and bounded implementation choices

The dashboard still explicitly invokes schema push plus prisma/seed.ts as stated in the prompt; the operator must verify this in Part C. Repository build scripts alone cannot apply additions. No successful remote execution is assumed.

Rows in models without isDemo are protected; actual incoming relations come from Prisma DMMF. Demo fixtures use synthetic example.invalid identities and avoid protected department/team manager references. Existing user department membership is preserved; only null roleId values receive the specified legacy backfill. PARTIAL scope retains existing granted behavior; missing required scope context denies. Server-generated storage identifiers use a c-prefixed 24-hex random token. The legacy authorization matrix remains intentionally in place until v0.8.0. None of these choices adds task approvals, permission keys, a System Admin feature flag or a new product flow.

PowerShell lifecycle shell configuration is process-local to this Windows A&N path; Linux Render keeps its normal shell. Explicit Prisma generation avoids relying on postinstall side effects. No global npm configuration changed.

## Ahmad's next actions

1. Part A is already confirmed; add the missing backup artifact identifiers for traceability.
2. Follow runbook Parts B–C, including paid-plan/disk verification, auth environment settings and recoverable file migration. Keep source files until checksum/restore evidence is accepted.
3. Complete the Antigravity staging checks below and request the separate implementation review. Do not admit real users/client data before all pilot gates pass.

## Antigravity checklist

- [ ] Picker requires the secret; unavailable state is localized when disabled.
- [ ] Forged cookie is rejected.
- [ ] An actual /uploads/<file> URL returns 404 with and without a session.
- [ ] Downloads require login and authorization; compare file checksum with the backup.
- [ ] An editable matrix change survives redeploy/reference seeding.
- [ ] Employee cannot list/download unassigned-case files.
- [ ] Employee can read but cannot delete assigned-case files.
- [ ] Arabic/English login layout and password field render correctly.
- [ ] Separate implementation review passes.

STATUS: ready for implementation review
