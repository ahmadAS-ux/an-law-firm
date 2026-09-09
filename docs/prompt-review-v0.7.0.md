# v0.7.0 prompt review

2026-09-09. Scope: execution blockers only; review completed within 15 minutes.

1. Several incoming-FK models (Team, Department, Invoice, InvoiceLine, Payment, BillingRate, Hearing, ConflictCheck) have no isDemo column. Filtering them by isDemo would fail Prisma validation. Treat rows in models without provenance as protected, except the explicitly specified AuditLog retention and Notification ownership rules. Derive relations from Prisma DMMF.
2. AuditLog.details is String?, not Json. Serialize before/after objects with JSON.stringify in policy reset and violation records.
3. Login page is src/app/(auth)/login/page.tsx and uses /logo.png. Include that asset in the stated login allow-list.
4. The restore rehearsal must use the matching pre-change application revision, or apply the additions migration before booting v0.7.0; the pre-change dump lacks required v0.7.0 columns.
5. Use installed Node CLI paths in package scripts for this Windows workspace. Runtime uses PowerShell; POSIX inline environment assignments in the illustrative commands must be expressed as process-scoped environment settings. Never modify .env.

No product or authorization design decisions changed. Backup prerequisite satisfied by Ahmad's invocation confirmation. Remote database commands remain prohibited for this execution.

## Execution-discovered command blocker (after initial review)

Plain npm ci fails in this actual Windows path during unrs-resolver postinstall: cmd.exe splits A&N, reporting `'N' is not recognized` and `Cannot find module ...napi-postinstall/lib/cli.js`. Retry npm ci with the current PowerShell 7 executable as its process-local npm_config_script_shell; no global npm configuration or .env is changed. Original failure output: verification/npm-ci.log. Installation verification is recorded separately.

The clean-install postinstall did not regenerate this project's Prisma types. Before TypeScript checks after npm ci, run npm run db:generate with the isolated process environment. This is client generation only, not a database mutation. TypeScript's pre-generation diagnostics are preserved in verification/typecheck-before-generate.log.
