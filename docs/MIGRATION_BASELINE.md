# v0.7.0 migration and storage cutover

Status: operator runbook. No remote database commands were executed by the agent.
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

The user reports that the dashboard explicitly invokes schema push and prisma/seed.ts. That path now reaches a reference-only compatibility seed. Repository build and render-build scripts do not mutate the DB. Verify the actual dashboard command: if it only invokes npm run build/render-build, it will NOT apply new columns; complete migrations with the operator before serving the new code. Do not assume a successful remote deployment.

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
