# v0.7.0 migration and storage cutover

Status: staging recovery retried 2026-09-10; Render MCP is authenticated and inspection is complete. Process credentials contain placeholders. The first Prisma reconciliation command failed P1001 before connecting; no remote database mutation, configuration change, deployment or push occurred. See the latest Part C status below.
Part A is confirmed by Ahmad in the invocation and docs/backups/PART_A_2026-09.md. Backup artifacts and restoration remain operator evidence, not independently verified here.

## Command conventions

Use the installed Prisma 6 CLI: `node node_modules/prisma/build/index.js`, or `npm run db:diff -- ...`. On Windows set environment variables in the current PowerShell process (`$env:DATABASE_URL = ...`); never paste a real URL into committed documentation or logs. Use the copied database for rehearsals. `migrate status` is a history check; `migrate diff --exit-code` is the schema comparison (0 empty, 2 different).

## Part A — BEFORE the first push

1. Optionally suspend Render automatic deployment during the window. Agent does not change Render settings.
2. Full `pg_dump` and `pg_dump --schema-only` of staging BEFORE v0.7.0 additions; copy all existing `public/uploads` files off the old instance with SHA-256 checksums. Record dump filename, size, capture time and checksum-manifest filename in the backup record. This is also necessary if files are currently on ephemeral storage.

## Part B — disposable local rehearsals

3. Restore the pre-change dump to a disposable PostgreSQL database. Compare it to `prisma/.baseline/schema.original.prisma` using `migrate diff --from-url <copy> --to-schema-datamodel prisma/.baseline/schema.original.prisma --exit-code`. Inspect the schema-only dump for unmanaged views, triggers, extensions and indexes. Resolve baseline discrepancies; never erase them with a reset.
4. Clean install: empty database → `npm run db:migrate` (both migrations) → `npm run db:seed:reference` → app boot. This was tested on local PostgreSQL 18.4; see verification logs. Restore of Ahmad's actual dump is still manual.
5. Already-updated rehearsal: restore the original dump; run the guarded `npm run db:push:local` on the loopback copy to simulate the legacy dashboard command; compare to the UPDATED schema with `--exit-code` and require 0. Then run `migrate resolve --applied 0_init` and `migrate resolve --applied 20260909000000_v070_baseline_additions`; `migrate status` must be clean. Copy backup files into the scratch app's `public/uploads`; run upload migration dry-run → apply → verify.

## Part C — staging reconciliation after the first auto-deploy

VERIFIED 2026-09-10: the actual dashboard Build Command is `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`. The failed deploy attempted 0_init and failed P3018 on the existing MatterStatus type. This supersedes the earlier schema-push assumption. Repository build and render-build scripts do not mutate the DB. The ordered recovery sequence in the latest status below supersedes steps 6-7 for this failed-initial-baseline case.

6. Compare staging against updated `prisma/schema.prisma`: `migrate diff --from-url <staging> --to-schema-datamodel prisma/schema.prisma --exit-code`. Require 0. IF NOT EXISTS avoids duplicate objects but cannot validate their types/constraints. If differences remain, stop reconciliation and resolve them explicitly.
7. Only on exact agreement, mark `0_init` and `20260909000000_v070_baseline_additions` applied using `migrate resolve --applied ...`; check `migrate status`.
8. Verify paid Render service plan and an attached persistent disk. Set `UPLOAD_DIR` to its absolute mounted path. Set a signing secret of at least 32 UTF-8 bytes, `DEV_LOGIN_PICKER_ENABLED=true`, a separate `DEV_LOGIN_SECRET`, and `STAGING_BASIC_AUTH=user:password`. Picker and shared credentials are seed-data testing only. Leave demo/reset flags unset on shared staging. NEXT_PUBLIC_APP_ENV controls presentation only.
9. File migration must run in the service shell with access to its disk, not in pre-deploy compute. If the old ephemeral files no longer exist on the new instance, restore them from Part A into `public/uploads` first; the URL denial remains active. Run:

   ```text
   node node_modules/tsx/dist/cli.mjs scripts/migrate-uploads.ts --dry-run
   node node_modules/tsx/dist/cli.mjs scripts/migrate-uploads.ts --apply
   node node_modules/tsx/dist/cli.mjs scripts/migrate-uploads.ts --verify
   ```

   Copy operations are exclusive, checksummed, and precede conditional database updates. The ignored progress log is a recovery hint, never authority over database mappings. Preserve sources and orphan copies until verification. Source removal is an operator action after verified backup; the script never deletes files.
10. Set dashboard build command to `npm ci && npm run build` (dependency install plus mutation-free build), and paid-instance pre-deploy command to `npm run release` (migrations plus reference seed). Repository render.yaml uses the same build; its paid pre-deploy setting is documented pending actual plan verification. Do not put file migration in pre-deploy.
11. Verify picker secret, forged cookie rejection, `/uploads/<real filename>` 404 with and without a session, authenticated download checksums against Part A, Employee scope, and a matrix change surviving a redeploy.
12. Restore rehearsal for pilot entry: restore dump AND files into scratch storage, boot matching pre-change code OR migrate the restored DB before booting v0.7.0, and verify business-record counts and sample download checksums. Record artifact identifiers, elapsed time, recovery steps and result. This is distinct from the synthetic local integration tests.

## Recovery

Stop writes, preserve the current database and file copies, restore the matching database backup and sources, run schema reconciliation for the selected application revision, and rerun the resumable file migration. Do not blindly mark partially applied migrations complete. No automatic rollback or source deletion is performed.


## Part C recovery status — 2026-09-09/10

Evidence: [sanitized command record](verification/staging-recovery-2026-09-09.md). The recovery instruction supersedes the earlier already-updated-schema assumption. Do not mark additions applied until the actual database state is verified.

| Recovery task | Done? | Evidence / next required condition |
|---|---|---|
| Configure Render MCP URL/client | Configuration added | codex mcp add completed registration; OAuth did not complete; mcp list reports Not logged in |
| Select workspace; fetch service/database/failed-deploy log | No | No authenticated Render MCP connection; service plan/build/pre-deploy/auto-deploy/disk are unknown |
| 2a: resolve 0_init rolled-back | No | DATABASE_URL absent in process, user and machine environments; no dotenv fallback allowed |
| 2b: compare database with original snapshot | No | Depends on 2a and authorized shell URL; any difference stops remaining database work |
| 2c: resolve 0_init applied | No | Original-schema agreement not established |
| 2d: apply additions with migrate deploy | No | Baseline not reconciled |
| 2e-f: clean status and empty updated-schema diff | No | No database access; never assumed clean |
| 2g: reference-only seed | Entry point confirmed; not run | package script selects reference branch, which calls seedReference only |
| Env variables, secret generation and build/pre-deploy updates | No | OAuth incomplete and RENDER_API_KEY absent; existing settings preserved |
| Trigger deployment and capture logs | No | Reconciliation/configuration prerequisites failed |
| Post-deployment HTTP verification | No | No recovery deploy; diagnostic GET /api/tasks currently returns 307, not required 401 JSON |
| Private disk and files, migration/checksum evidence, restore rehearsal | No | Remain unchanged/manual; no disk or plan changes authorized |

When authenticated access and process credentials become available, execute exactly: `node .\node_modules\prisma\build\index.js migrate resolve --rolled-back 0_init`; `migrate diff --from-url $env:DATABASE_URL --to-schema-datamodel prisma/.baseline/schema.original.prisma --exit-code` (require exit 0); `migrate resolve --applied 0_init`; `migrate deploy`; `migrate status`; updated-schema diff with `--exit-code` (require exit 0); then `npm run db:seed:reference`. Every Prisma subcommand uses that same explicit Node CLI path. Capture/redact all output in memory before logging; never print the expanded URL. Stop on any failed prerequisite or nonempty original-schema diff.

The current recovery request specifies Build Command `npm run build` and Pre-Deploy Command `npm run release` if supported. If unsupported, its explicitly accepted staging exception is Build Command `npm run build && npm run release`; document the exception in SECURITY.md only when that configuration is actually selected. Do not change plan/disk/auto-deploy. These settings have NOT been applied here.

The planned local dev-login-secret file is docs/backups/.dev-login-secret.local and is ignored by Git. It has not been created; no new secret was generated or uploaded.


## Part C recovery status — 2026-09-10 (latest)

Evidence: [command and output record](verification/staging-recovery-2026-09-10.md), including the complete failed-deploy log; structured log: [Render failure](verification/render-failed-deploy-2026-09-10.json).

| Task | Done? | Evidence |
|---|---|---|
| Workspace and service/database inspection | Yes | Explicit workspace tea-d75k71nfte5s73fdo810 matches both resources; service Starter, auto-deploy yes/commit/main; database available on PostgreSQL 16 |
| Actual Build Command and failed log | Yes | npm install && npx prisma generate && npx prisma migrate deploy && npm run build; dep-dagsbh49v7es73ejbn2g failed P3018 on MatterStatus |
| Pre-Deploy Command and persistent disk | Not confirmed | Fields absent from MCP response; REST could not authenticate with placeholder process API key |
| 2a: resolve 0_init rolled-back | No | Attempt failed P1001; process URL contains placeholder and does not match target database host; no connection or mutation |
| 2b: original-schema diff | Not run | 2a prerequisite failed; no schema agreement claimed |
| 2c: resolve 0_init applied | Not run | Requires empty original-schema diff |
| 2d: migrate deploy | Not run | Requires reconciled baseline |
| 2e-f: migrate status and updated-schema diff | Not run | Requires successful migrations |
| 2g: reference-only seed | Entry confirmed; not run | CLI reference branch calls seedReference; no demo/reset invocation |
| Step 3 environment and REST command updates | Not done | Prerequisites failed; preserved existing environment and settings; no secrets generated |
| Step 4 deploy, logs and four HTTP assertions | Not done | No recovery deployment; cannot claim post-deployment verification |
| Step 5 documentation and commit | Local commit only | Step 4 did not pass, so no push to main |

Resume only with valid credentials in the process environment. Execute in order: resolve --rolled-back 0_init; diff from the process URL to prisma/.baseline/schema.original.prisma with --exit-code (require 0); resolve --applied 0_init; migrate deploy; migrate status; diff to prisma/schema.prisma with --exit-code (require 0); npm.cmd run db:seed:reference. Use node .\node_modules\prisma\build\index.js for every Prisma command. Any original-schema difference stops database steps and permits reporting only. Never source credentials from .env.

Then set the requested four environment variables with merge semantics, set Build Command to npm run build and Pre-Deploy Command to npm run release using REST, preserve plan/disk/auto-deploy, deploy and verify all four requested HTTP assertions before pushing. No dev secret was created in this attempt; the reserved ignored path is docs/backups/.dev-login-secret.local. Historical status sections above describe prior attempts.
