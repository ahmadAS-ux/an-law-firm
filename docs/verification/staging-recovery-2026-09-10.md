# Staging recovery 2026-09-10

Secret values are redacted before output is recorded. No .env file is read for credentials.

## Initial discovery
Command: `Get-Location; rg --files -g AGENTS.md -g '*MIGRATION_BASELINE*' -g '*PART_A_2026-09*' -g package.json -g LAST_SESSION.md -g BUGFIX.md -g hosting.json -g '*render*' -g '.gitignore'`
Output: workspace confirmed; found render.yaml, BUGFIX.md, .gitignore, LAST_SESSION.md, docs/MIGRATION_BASELINE.md, package.json, docs/backups/PART_A_2026-09.md, src/lib/renderBidiText.ts. No AGENTS.md or hosting.json found by this tracked-file discovery.
Tool discovery: Render MCP tools are available (workspace, service, database, logs, deploy, environment updates).

## Render MCP inspection commands and output
Workspace selected by explicit request scope after matching both supplied resource IDs to their owner; deprecated session selection was not needed.

`list_workspaces({})`
```json
[
  {
    "id": "tea-d75k71nfte5s73fdo810",
    "name": "ahmad's workspace",
    "type": "team"
  }
]
```

`get_service({serviceId:"srv-d79p63fkijhs7391qj30",workspaceId:"tea-d75k71nfte5s73fdo810"})`
```text
{"autoDeploy":"yes","autoDeployTrigger":"commit","branch":"main","createdAt":"2026-04-06T11:03:42.283913Z","dashboardUrl":"https://dashboard.render.com/web/srv-d79p63fkijhs7391qj30","id":"srv-d79p63fkijhs7391qj30","name":"an-law-firm","notifyOnFail":"default","ownerId":"tea-d75k71nfte5s73fdo810","repo":"https://github.com/ahmadAS-ux/an-law-firm","rootDir":"","serviceDetails":{"buildPlan":"starter","cache":{"profile":"no-cache"},"env":"node","envSpecificDetails":{"buildCommand":"npm install \u0026\u0026 npx prisma generate \u0026\u0026 npx prisma migrate deploy \u0026\u0026 npm run build","startCommand":"npm run start"},"healthCheckPath":"","ipAllowList":[{"cidrBlock":"0.0.0.0/0","description":"everywhere"}],"maintenanceMode":{"enabled":false,"uri":""},"numInstances":1,"openPorts":[{"port":10000,"protocol":"TCP"}],"plan":"starter","previews":{"generation":"off"},"pullRequestPreviewsEnabled":"no","region":"oregon","runtime":"node","sshAddress":"srv-d79p63fkijhs7391qj30@ssh.oregon.render.com","url":"https://an-law-firm.onrender.com"},"slug":"an-law-firm","suspended":"not_suspended","suspenders":[],"type":"web_service","updatedAt":"2026-06-18T15:52:38.383047Z"}
```

`get_postgres({postgresId:"dpg-d79ounk50q8c73fn5k8g-a",workspaceId:"tea-d75k71nfte5s73fdo810"})`
```text
{"connectionPool":"none","createdAt":"2026-04-06T10:47:58.777802Z","dashboardUrl":"https://dashboard.render.com/d/dpg-d79ounk50q8c73fn5k8g-a","databaseName":"an_law_firm_db","databaseUser":"an_law_firm_db_user","diskAutoscalingEnabled":false,"diskSizeGB":1,"environmentId":"evm-d79o30nkijhs7391b4hg","highAvailabilityEnabled":false,"id":"dpg-d79ounk50q8c73fn5k8g-a","ipAllowList":[{"cidrBlock":"0.0.0.0/0","description":"everywhere"}],"name":"an-law-firm-db","owner":{"email":"ahmad.alsaif@gmail.com","id":"tea-d75k71nfte5s73fdo810","name":"ahmad's workspace","type":"team"},"plan":"basic_256mb","readReplicas":[],"region":"oregon","role":"primary","status":"available","suspended":"not_suspended","suspenders":[],"updatedAt":"2026-04-06T10:47:58.777802Z","version":"16"}
```

`list_deploys({serviceId:"srv-d79p63fkijhs7391qj30",workspaceId:"tea-d75k71nfte5s73fdo810",limit:5})`
```text
[{"commit":{"createdAt":"2026-09-09T20:46:39Z","id":"16930c251e0dcece5b3a3044727b6f9bd55b7dae","message":"v0.7.0 — Safe baseline: seed safety, migrations, auth and upload hardening"},"createdAt":"2026-09-09T20:47:00.387945Z","finishedAt":"2026-09-09T20:47:40.49427Z","id":"dep-dagsbh49v7es73ejbn2g","startedAt":"2026-09-09T20:47:00.302895Z","status":"build_failed","trigger":"new_commit","updatedAt":"2026-09-09T20:47:40.494751Z"},{"commit":{"createdAt":"2026-05-21T01:50:08Z","id":"94683af3379dbe112592f9ce145f14082f23965f","message":"docs — reconciliation pass: version sync, CHANGELOG backfill, TESTING rewrite, Deploy.md → .claude/commands/, archive UI_UX_REVIEW, de-dupe version rules, skills.md merged into CLAUDE.md\n\nCo-Authored-By: Claude Sonnet 4.6 \u003cnoreply@anthropic.com\u003e"},"createdAt":"2026-06-18T15:51:55.784648Z","finishedAt":"2026-06-18T15:52:38.380669Z","id":"dep-d8q186p9rddc73dd1pi0","startedAt":"2026-06-18T15:51:57.496591Z","status":"live","trigger":"deployed_by_render","updatedAt":"2026-06-18T15:53:06.039688Z"},{"commit":{"createdAt":"2026-05-21T01:50:08Z","id":"94683af3379dbe112592f9ce145f14082f23965f","message":"docs — reconciliation pass: version sync, CHANGELOG backfill, TESTING rewrite, Deploy.md → .claude/commands/, archive UI_UX_REVIEW, de-dupe version rules, skills.md merged into CLAUDE.md\n\nCo-Authored-By: Claude Sonnet 4.6 \u003cnoreply@anthropic.com\u003e"},"createdAt":"2026-05-29T14:15:09.390732Z","finishedAt":"2026-05-29T14:16:05.044974Z","id":"dep-d8cpurcvikkc73b5361g","startedAt":"2026-05-29T14:15:11.389174Z","status":"deactivated","trigger":"deployed_by_render","updatedAt":"2026-06-18T15:52:38.378205Z"},{"commit":{"createdAt":"2026-05-21T01:50:08Z","id":"94683af3379dbe112592f9ce145f14082f23965f","message":"docs — reconciliation pass: version sync, CHANGELOG backfill, TESTING rewrite, Deploy.md → .claude/commands/, archive UI_UX_REVIEW, de-dupe version rules, skills.md merged into CLAUDE.md\n\nCo-Authored-By: Claude Sonnet 4.6 \u003cnoreply@anthropic.com\u003e"},"createdAt":"2026-05-21T01:50:19.444039Z","finishedAt":"2026-05-21T01:52:41.690306Z","id":"dep-d8769mrrjlhs73bv22q0","startedAt":"2026-05-21T01:50:19.399666Z","status":"deactivated","trigger":"new_commit","updatedAt":"2026-05-29T14:16:05.042767Z"},{"commit":{"createdAt":"2026-05-13T19:32:11Z","id":"f57a8290537ac56b0b59551253e62aa3976abfea","message":"v0.6.2 — fix HR Reports theme override (CSS variables + Recharts useTheme)"},"createdAt":"2026-05-13T19:32:19.422553Z","finishedAt":"2026-05-13T19:34:49.604183Z","id":"dep-d82d3gl0lvsc73e1jjsg","startedAt":"2026-05-13T19:32:19.159657Z","status":"deactivated","trigger":"new_commit","updatedAt":"2026-05-21T01:52:41.689065Z"}]

 cursor: jWpjdSN-6L0zZ2wwbHZzYzczZTFqanNn
```

`list_logs({resource:["srv-d79p63fkijhs7391qj30"],workspaceId:"tea-d75k71nfte5s73fdo810",startTime:"2026-09-09T20:47:00Z",endTime:"2026-09-09T20:48:00Z",type:["build"],limit:1000,direction:"forward"})`
Output: hasMore=false; full structured output saved in render-failed-deploy-2026-09-10.json.
```text
2026-09-09T20:47:03.748560933Z ==> Downloading cache...
2026-09-09T20:47:03.776597266Z ==> Cloning from https://github.com/ahmadAS-ux/an-law-firm
2026-09-09T20:47:10.022098924Z ==> Checking out commit 16930c251e0dcece5b3a3044727b6f9bd55b7dae in branch main
2026-09-09T20:47:16.334556432Z ==> Downloaded 240MB in 10s. Extraction took 2s.
2026-09-09T20:47:16.940862997Z ==> Requesting Node.js version >=20.0.0
2026-09-09T20:47:17.118435769Z ==> Using Node.js version 26.8.2 via /opt/render/project/src/package.json
2026-09-09T20:47:17.118451497Z ==> Docs on specifying a Node.js version: https://render.com/docs/node-version
2026-09-09T20:47:17.118545667Z ==> Installing Node.js version 26.8.2...
2026-09-09T20:47:18.621346398Z ==> Running build command 'npm install && npx prisma generate && npx prisma migrate deploy && npm run build'...
2026-09-09T20:47:36.507701003Z
2026-09-09T20:47:36.507734174Z added 566 packages, and audited 567 packages in 18s
2026-09-09T20:47:36.507745099Z
2026-09-09T20:47:36.507890799Z 136 packages are looking for funding
2026-09-09T20:47:36.507954577Z   run `npm fund` for details
2026-09-09T20:47:36.710004363Z
2026-09-09T20:47:36.710034492Z 20 vulnerabilities (4 low, 4 moderate, 11 high, 1 critical)
2026-09-09T20:47:36.710036122Z
2026-09-09T20:47:36.710037746Z To address issues that do not require attention, run:
2026-09-09T20:47:36.710039132Z   npm audit fix
2026-09-09T20:47:36.710040281Z
2026-09-09T20:47:36.710041875Z To address all issues (including breaking changes), run:
2026-09-09T20:47:36.710043654Z   npm audit fix --force
2026-09-09T20:47:36.71004487Z
2026-09-09T20:47:36.710046541Z Run `npm audit` for details.
2026-09-09T20:47:37.574982828Z warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
2026-09-09T20:47:37.575007017Z For more information, see: https://pris.ly/prisma-config
2026-09-09T20:47:37.575008698Z
2026-09-09T20:47:37.737113794Z Prisma schema loaded from prisma/schema.prisma
2026-09-09T20:47:38.132899424Z ┌─────────────────────────────────────────────────────────┐
2026-09-09T20:47:38.132918334Z │  Update available 6.19.3 -> 8.0.0-rc.13                 │
2026-09-09T20:47:38.132920106Z │                                                         │
2026-09-09T20:47:38.132923745Z │  This is a major update - please follow the guide at    │
2026-09-09T20:47:38.132925198Z │  https://pris.ly/d/major-version-upgrade                │
2026-09-09T20:47:38.132926004Z
2026-09-09T20:47:38.132926687Z │                                                         │
2026-09-09T20:47:38.13292802Z │  Run the following to update                            │
2026-09-09T20:47:38.132939977Z ✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 175ms
2026-09-09T20:47:38.132941852Z
2026-09-09T20:47:38.132943334Z Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
2026-09-09T20:47:38.132959511Z
2026-09-09T20:47:38.132961144Z Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
2026-09-09T20:47:38.132962346Z
2026-09-09T20:47:38.132967106Z │    npm i --save-dev prisma@latest                       │
2026-09-09T20:47:38.132968484Z │    npm i @prisma/client@latest                          │
2026-09-09T20:47:38.132971677Z └─────────────────────────────────────────────────────────┘
2026-09-09T20:47:38.941104092Z warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
2026-09-09T20:47:38.941128663Z For more information, see: https://pris.ly/prisma-config
2026-09-09T20:47:38.941131255Z
2026-09-09T20:47:39.06490522Z Prisma schema loaded from prisma/schema.prisma
2026-09-09T20:47:39.068301073Z Datasource "db": PostgreSQL database "an_law_firm_db", schema "public" at "dpg-d79ounk50q8c73fn5k8g-a"
2026-09-09T20:47:39.176629261Z
2026-09-09T20:47:39.176652758Z 2 migrations found in prisma/migrations
2026-09-09T20:47:39.176654422Z
2026-09-09T20:47:39.345935178Z Applying migration `0_init`
2026-09-09T20:47:39.355383761Z Error: P3018
2026-09-09T20:47:39.355401168Z
2026-09-09T20:47:39.355404288Z A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve
2026-09-09T20:47:39.355405959Z
2026-09-09T20:47:39.355408121Z Migration name: 0_init
2026-09-09T20:47:39.355409326Z
2026-09-09T20:47:39.355410993Z Database error code: 42710
2026-09-09T20:47:39.355412402Z
2026-09-09T20:47:39.355413929Z Database error:
2026-09-09T20:47:39.355415513Z ERROR: type "MatterStatus" already exists
2026-09-09T20:47:39.355416686Z
2026-09-09T20:47:39.355418666Z DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \"MatterStatus\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1167), routine: Some("DefineEnum") }
2026-09-09T20:47:39.355420006Z
2026-09-09T20:47:39.355421085Z
2026-09-09T20:47:39.399715892Z ==> Build failed 😞
2026-09-09T20:47:39.399731321Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
```

## Confirmed settings and recovery gate
- Service: Starter; auto-deploy yes / commit on main.
- Actual Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` (observed only; never executed locally).
- Pre-Deploy Command: field absent from MCP service response; cannot independently confirm blank versus unexposed.
- Persistent disk: no disk field in MCP response; attachment remains unconfirmed because REST inspection could not authenticate.
- Database: an-law-firm-db, available, PostgreSQL 16, basic_256mb, Oregon.
- DATABASE_URL and RENDER_API_KEY are present but both contain placeholder text; database host does not match supplied database ID and API key contains non-ASCII placeholder text. Values never recorded.
- Step 2a failed P1001 before any database mutation. Steps 2b-g not run; no schema agreement claimed. Prisma reported loading .env internally, but the supplied process DATABASE_URL took precedence; no credential was read from .env by recovery scripts.
- Reference-only seed entry confirmed by reading package.json, prisma/seed/cli.ts and prisma/seed/reference.ts. Not executed.
- Steps 3-4 not attempted because reconciliation and valid REST credential prerequisites failed. No remote environment changes, new secret, deploy or push.
- DEV_LOGIN_SECRET was not generated. Its intended gitignored path remains docs/backups/.dev-login-secret.local.
- Existing unrelated .env.example modification excluded from this recovery commit.

## Logging setup and file operations
The initial PowerShell bootstrap created docs/verification and this report with New-Item/Set-Content, and wrote recovery-runner.cjs (success). The runner captures child output in memory and redacts secret process values before recording or displaying output. apply_patch created render-failed-deploy-2026-09-10.json, render-inspect.cjs and check-recovery-env.cjs, then updated safe error classification (all succeeded). Tool discovery listed the available Render MCP tools. The REST inspection was also retried with network escalation; same safe failure, no remote mutation.


## 2026-09-09T21:34:04.733Z
```powershell
Get-Content docs/MIGRATION_BASELINE.md, docs/backups/PART_A_2026-09.md, package.json, .gitignore; git status --short; Get-ChildItem -Force -Name .agents,.codex -ErrorAction SilentlyContinue; Write-Output (DATABASE_URL
```
```text
Missing closing ')' in expression.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : MissingEndParenthesisInExpression


Exit: 1
```

## 2026-09-09T21:34:23.199Z
```powershell
Get-Content docs/MIGRATION_BASELINE.md, docs/backups/PART_A_2026-09.md, package.json, .gitignore; git status --short
```
```text
# v0.7.0 migration and storage cutover

Status: staging recovery attempted 2026-09-09/10; blocked before database reconciliation because the required process credentials are absent and Render OAuth is incomplete. No remote database commands were executed by the agent.
Part A is confirmed by Ahmad in the invocation and docs/backups/PART_A_2026-09.md. Backup artifacts and restoration remain operator evidence, not independently verified here.

## Command conventions

Use the installed Prisma 6 CLI: `node node_modules/prisma/build/index.js`, or `npm run db:diff -- ...`. On Windows set environment variables in the current PowerShell process (`$env:DATABASE_URL = ...`); never paste a real URL into committed documentation or logs. Use the copied database for rehearsals. `migrate status` is a history check; `migrate diff --exit-code` is the schema comparison (0 empty, 2 different).

## Part A â€” BEFORE the first push

1. Optionally suspend Render automatic deployment during the window. Agent does not change Render settings.
2. Full `pg_dump` and `pg_dump --schema-only` of staging BEFORE v0.7.0 additions; copy all existing `public/uploads` files off the old instance with SHA-256 checksums. Record dump filename, size, capture time and checksum-manifest filename in the backup record. This is also necessary if files are currently on ephemeral storage.

## Part B â€” disposable local rehearsals

3. Restore the pre-change dump to a disposable PostgreSQL database. Compare it to `prisma/.baseline/schema.original.prisma` using `migrate diff --from-url <copy> --to-schema-datamodel prisma/.baseline/schema.original.prisma --exit-code`. Inspect the schema-only dump for unmanaged views, triggers, extensions and indexes. Resolve baseline discrepancies; never erase them with a reset.
4. Clean install: empty database â†’ `npm run db:migrate` (both migrations) â†’ `npm run db:seed:reference` â†’ app boot. This was tested on local PostgreSQL 18.4; see verification logs. Restore of Ahmad's actual dump is still manual.
5. Already-updated rehearsal: restore the original dump; run the guarded `npm run db:push:local` on the loopback copy to simulate the legacy dashboard command; compare to the UPDATED schema with `--exit-code` and require 0. Then run `migrate resolve --applied 0_init` and `migrate resolve --applied 20260909000000_v070_baseline_additions`; `migrate status` must be clean. Copy backup files into the scratch app's `public/uploads`; run upload migration dry-run â†’ apply â†’ verify.

## Part C â€” staging reconciliation after the first auto-deploy

SUPERSEDED ASSUMPTION: the implementation prompt said the dashboard explicitly invoked schema push and prisma/seed.ts. The recovery report instead describes migrate deploy attempting 0_init and failing P3018. The exact dashboard command has not been fetched because Render OAuth is incomplete. That path now reaches a reference-only compatibility seed. Repository build and render-build scripts do not mutate the DB. Verify the actual dashboard command: if it only invokes npm run build/render-build, it will NOT apply new columns; complete migrations with the operator before serving the new code. Do not assume a successful remote deployment.

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


## Part C recovery status â€” 2026-09-09/10

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
# Part A backup confirmation

Recorded: 2026-09-09

Ahmad confirmed in the invocation message:

PART A BACKUP DONE: yes

This records the user confirmation accepted by the v5 prompt's push prerequisite. Backup contents and restore success have not been independently verified.

- Backup completion date/time: not supplied separately.
- Dump filename and size: not supplied.
- Uploads checksum-list filename: not supplied.
- Restore rehearsal: remains a separate pilot entry gate.
{
  "name": "an-law-firm",
  "version": "0.7.0",
  "private": true,
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "node node_modules/next/dist/bin/next dev",
    "build": "node node_modules/prisma/build/index.js generate && node node_modules/next/dist/bin/next build",
    "start": "node node_modules/next/dist/bin/next start",
    "lint": "node node_modules/next/dist/bin/next lint",
    "db:generate": "node node_modules/prisma/build/index.js generate",
    "db:seed": "npm run db:seed:reference",
    "db:studio": "node node_modules/prisma/build/index.js studio",
    "render-build": "node node_modules/prisma/build/index.js generate && node node_modules/next/dist/bin/next build",
    "next": "node node_modules/next/dist/bin/next",
    "test": "node node_modules/vitest/vitest.mjs",
    "test:ui": "node node_modules/vitest/vitest.mjs --ui",
    "test:run": "node node_modules/vitest/vitest.mjs run",
    "db:migrate": "node node_modules/prisma/build/index.js migrate deploy",
    "db:diff": "node node_modules/prisma/build/index.js migrate diff",
    "db:push:local": "node scripts/db-push-local.cjs",
    "release": "npm run db:migrate && npm run db:seed:reference",
    "db:seed:reference": "node node_modules/tsx/dist/cli.mjs prisma/seed/cli.ts reference",
    "db:seed:demo": "node node_modules/tsx/dist/cli.mjs prisma/seed/cli.ts demo",
    "db:policy:reset": "node node_modules/tsx/dist/cli.mjs prisma/seed/cli.ts reset",
    "typecheck": "node node_modules/typescript/bin/tsc --noEmit"
  },
  "prisma": {
    "seed": "node node_modules/tsx/dist/cli.mjs prisma/seed.ts"
  },
  "dependencies": {
    "@base-ui/react": "^1.3.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@prisma/client": "^6.19.3",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^1.7.0",
    "next": "14.2.15",
    "next-themes": "^0.4.6",
    "prisma": "^6.19.3",
    "react": "^18",
    "react-day-picker": "^9.14.0",
    "react-dom": "^18",
    "recharts": "^3.8.1",
    "server-only": "^0.0.1",
    "shadcn": "^4.1.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss-animate": "^1.0.7",
    "tailwindcss-rtl": "^0.9.0",
    "tsx": "^4.21.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^20.19.39",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitest/ui": "^4.1.5",
    "eslint": "^8",
    "eslint-config-next": "14.2.15",
    "jsdom": "^29.1.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5",
    "vitest": "^4.1.5"
  }
}
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files â€” DO NOT commit .env (contains DATABASE_URL + secrets)
.env
.env.*
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma local database
prisma/*.db
prisma/*.db-journal
prisma/*.db-wal
prisma/*.db-shm

.uploads/
.local-test/
scripts/migrate-uploads.progress.jsonl
.continue/
.serena/
.vscode/
.idea/

public/uploads/test-deny.pdf
.claude/
docs/backups/.dev-login-secret.local
 M .env.example
?? docs/verification/recovery-runner.cjs
?? docs/verification/staging-recovery-2026-09-10.md
warning: unable to access 'C:\Users\Administrator/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\Administrator/.config/git/ignore': Permission denied

Exit: 0
```

## 2026-09-09T21:34:23.487Z
```powershell
Test-Path Env:DATABASE_URL; Test-Path Env:RENDER_API_KEY
```
```text
True
True

Exit: 0
```

## 2026-09-09T21:34:42.504Z
```powershell
Get-Content prisma/seed/cli.ts, prisma/seed/reference.ts; Get-ChildItem -Path .. -Filter AGENTS.md; git branch --show-current; git log -1 --oneline
```
```text
import { PrismaClient } from "@prisma/client";
import { seedReference } from "./reference";
import { seedDemo } from "./demo";
import { resetPolicy } from "./reset-policy";
const db = new PrismaClient();
async function main() {
  switch (process.argv[2]) {
    case "reference": await seedReference(db); break;
    case "demo": { const result = await seedDemo(db); console.log(`Demo seed finished; retained audit users: ${result.retained.length}`); break; }
    case "reset": await resetPolicy(db, process.env.POLICY_RESET_ACTOR ?? ""); break;
    default: throw new Error("Expected reference, demo, or reset");
  }
}
main().catch((e: unknown) => { console.error(e instanceof Error ? e.message : "Seed failed"); process.exitCode = 1; }).finally(() => db.$disconnect());
import type { PrismaClient } from "@prisma/client";
import { PERMISSIONS, ROLE_MATRIX, ROLES_DEF } from "./policy";

export async function seedReference(db: PrismaClient) {
  for (const d of [{ name: "Litigation", nameAr: "Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ" }, { name: "Corporate", nameAr: "Ø§Ù„Ø´Ø±ÙƒØ§Øª" }]) {
    await db.department.upsert({ where: { name: d.name }, create: d, update: {} });
  }
  const roles: Record<string, string> = {};
  for (const role of ROLES_DEF) {
    const row = await db.role.upsert({ where: { name: role.name }, create: role,
      update: { nameAr: role.nameAr, isLocked: role.isLocked } });
    roles[role.name] = row.id;
  }
  for (const definition of PERMISSIONS) {
    const permission = await db.permission.upsert({ where: { key: definition.key }, create: definition,
      update: { category: definition.category, description: definition.description, descriptionAr: definition.descriptionAr } });
    for (const role of ROLES_DEF) {
      const grant = ROLE_MATRIX[role.name][definition.key] ?? { granted: false };
      const policy = { granted: grant.granted, scope: grant.scope ?? "ALL", isLocked: grant.isLocked ?? false, lockedDirection: grant.lockedDirection ?? null };
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roles[role.name], permissionId: permission.id } },
        create: { roleId: roles[role.name], permissionId: permission.id, ...policy },
        update: grant.isLocked && ["PARTNER", "SYSTEM_ADMIN"].includes(role.name) ? policy : {},
      });
    }
  }
  await db.reportConfig.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} });
  for (const [legacy, current] of Object.entries({ PARTNER: "PARTNER", ADMIN: "SYSTEM_ADMIN", MANAGER: "DEPARTMENT_MANAGER", EMPLOYEE: "EMPLOYEE" })) {
    await db.user.updateMany({ where: { role: legacy, roleId: null }, data: { roleId: roles[current] } });
  }
  return roles;
}
main
8f2ab94 chore: v0.7.0 staging recovery and Render reconfiguration

Exit: 0
```

## 2026-09-09T21:35:24.800Z
```powershell
node docs/verification/render-inspect.cjs
```
```text
Render inspection failed; exception omitted to protect credentials

Exit: 1
```

## 2026-09-09T21:35:39.948Z
```powershell
node .\node_modules\prisma\build\index.js migrate resolve --rolled-back 0_init
```
```text
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "%E2%80%A6"
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env
Error: P1001: Can't reach database server at `%E2%80%A6:5432`

Please make sure your database server is running at `%E2%80%A6:5432`.

Exit: 1
```

## 2026-09-09T21:35:45.721Z
```powershell
node docs/verification/render-inspect.cjs
```
```text
Render inspection failed; exception omitted to protect credentials

Exit: 1
```

## 2026-09-09T21:36:08.977Z
```powershell
node docs/verification/check-recovery-env.cjs; node docs/verification/render-inspect.cjs
```
```text
{"name":"DATABASE_URL","present":true,"containsPlaceholder":true,"matchesExpectedDatabaseHost":false}
{"name":"RENDER_API_KEY","present":true,"containsPlaceholder":true,"asciiOnly":false}
Render inspection failed; safe error classification: TypeError; code: unavailable

Exit: 1
```

## 2026-09-09T21:36:54.675Z
```powershell
Get-Content BUGFIX.md -TotalCount 45; Get-Content LAST_SESSION.md -Tail 45; git check-ignore docs/backups/.dev-login-secret.local; git diff --stat
```
```text
# A&N LPMS â€” Bug Tracker

> Every bug goes here immediately when found. Nothing gets fixed from memory.

---

## How to Add a Bug

```
### BUG-XXX â€” [Short title]
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

## ðŸ”´ Critical (System broken / data loss risk)

*(None)*

---

## ðŸŸ  High (Feature not working)

*(None)*

---

## ðŸŸ¡ Medium (Works but wrong)

*(None)*

---

## ðŸŸ¢ Low (Visual / minor)

*(None)*

---
- docs/MIGRATION_BASELINE.md:21 â€” Part C staging schema agreement before resolving both migrations; verify actual dashboard command and paid plan, persistent disk, secrets, file migration and checksum verification; then switch dashboard build/release commands.
- SECURITY.md:147 â€” Next.js 14.2.15 audit/advisory remains open by explicit scope. Close in v0.8.0 before real client data enters any internet-reachable environment. Ahmad accepts this push's staging auto-deploy only while staging contains seed data.
- SECURITY.md:149 â€” System Admin selector testing exception is documented only; default-off implementation in v0.8.0 and disabled before pilot.
- docs/AUTHZ_INVENTORY.md:1 â€” legacy/auth-only route authorization remains for v0.8.0 DB-backed enforcement.
- This file's Antigravity checklist â€” visual/staging checks and separate implementation review remain outstanding. Pilot entry requires evidence for all eight gates.

## Assumptions and bounded implementation choices

The dashboard still explicitly invokes schema push plus prisma/seed.ts as stated in the prompt; the operator must verify this in Part C. Repository build scripts alone cannot apply additions. No successful remote execution is assumed.

Rows in models without isDemo are protected; actual incoming relations come from Prisma DMMF. Demo fixtures use synthetic example.invalid identities and avoid protected department/team manager references. Existing user department membership is preserved; only null roleId values receive the specified legacy backfill. PARTIAL scope retains existing granted behavior; missing required scope context denies. Server-generated storage identifiers use a c-prefixed 24-hex random token. The legacy authorization matrix remains intentionally in place until v0.8.0. None of these choices adds task approvals, permission keys, a System Admin feature flag or a new product flow.

PowerShell lifecycle shell configuration is process-local to this Windows A&N path; Linux Render keeps its normal shell. Explicit Prisma generation avoids relying on postinstall side effects. No global npm configuration changed.

## Ahmad's next actions

1. Part A is already confirmed; add the missing backup artifact identifiers for traceability.
2. Follow runbook Parts Bâ€“C, including paid-plan/disk verification, auth environment settings and recoverable file migration. Keep source files until checksum/restore evidence is accepted.
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

## Staging recovery â€” 2026-09-09/10

Status: partial; no remote database/configuration mutation or deploy executed. Render MCP was configured using the requested URL/client id, but OAuth remains incomplete. DATABASE_URL and RENDER_API_KEY are absent in the execution environment, including the authorized unsandboxed check, and in user/machine variables. No .env fallback was used.

Evidence: docs/verification/staging-recovery-2026-09-09.md records sanitized commands/results and all blocked steps. Service plan, dashboard build/pre-deploy commands, auto-deploy, attached disk and failed-deploy logs could not be fetched. The user-reported P3018 contradicts the earlier db-push assumption; the exact dashboard command remains unverified.

Public diagnostics only (not post-deploy verification): /login 200, no password input in server-rendered HTML; /uploads/anything.pdf 404; /api/tasks 307 instead of required 401 JSON. The login HTML observation alone does not establish client-rendered UI behavior. The wrong-secret POST was not attempted without a verified active user id. Step 4 has not passed, so the recovery documentation is committed locally only; no push.

No new secrets were generated or installed. The planned local path docs/backups/.dev-login-secret.local has been added to .gitignore but no file created. Required next conditions are authenticated Render MCP access and the two credential variables available to the execution shell. Once available, follow the ordered Part C recovery table; stop database work on any original-schema differences. No claim of staging recovery or release sign-off is made.

STAGING: partial â€” Render OAuth incomplete and required shell credentials unavailable; verification did not pass.
docs/backups/.dev-login-secret.local
 .env.example | 19 +++----------------
 1 file changed, 3 insertions(+), 16 deletions(-)
warning: unable to access 'C:\Users\Administrator/.config/git/ignore': Permission denied
warning: in the working copy of '.env.example', LF will be replaced by CRLF the next time Git touches it

Exit: 0
```

Documentation edits: apply_patch updated runbook current status and verified command; node docs/verification/close-recovery.cjs appended the latest Part C done/not-done table, LAST_SESSION section and BUGFIX entry. Output: success. No application code changed.

## 2026-09-09T21:37:58.311Z
```powershell
node docs/verification/close-recovery.cjs; git diff --check; git status --short
```
```text
Updated MIGRATION_BASELINE.md, LAST_SESSION.md and BUGFIX.md with partial recovery evidence.
 M .env.example
 M BUGFIX.md
 M LAST_SESSION.md
 M docs/MIGRATION_BASELINE.md
?? docs/verification/check-recovery-env.cjs
?? docs/verification/close-recovery.cjs
?? docs/verification/recovery-runner.cjs
?? docs/verification/render-failed-deploy-2026-09-10.json
?? docs/verification/render-inspect.cjs
?? docs/verification/staging-recovery-2026-09-10.md
warning: in the working copy of '.env.example', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'BUGFIX.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'LAST_SESSION.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/MIGRATION_BASELINE.md', LF will be replaced by CRLF the next time Git touches it
warning: unable to access 'C:\Users\Administrator/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\Administrator/.config/git/ignore': Permission denied

Exit: 0
```

## 2026-09-09T21:38:29.629Z
```powershell
node docs/verification/verify-recovery.cjs; git diff --check -- BUGFIX.md LAST_SESSION.md docs/MIGRATION_BASELINE.md docs/verification; git add -- BUGFIX.md LAST_SESSION.md docs/MIGRATION_BASELINE.md docs/verification/recovery-runner.cjs docs/verification/check-recovery-env.cjs docs/verification/render-inspect.cjs docs/verification/close-recovery.cjs docs/verification/verify-recovery.cjs docs/verification/render-failed-deploy-2026-09-10.json docs/verification/staging-recovery-2026-09-10.md
```
```text
Secret scan: PASS; 10 recovery/documentation files checked; no secret values displayed.
warning: in the working copy of 'BUGFIX.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'LAST_SESSION.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/MIGRATION_BASELINE.md', LF will be replaced by CRLF the next time Git touches it
fatal: Unable to create 'C:/Users/Administrator/Documents/CLAUDE/A&N law firm/Sand/an-law-firm/.git/index.lock': Permission denied

Exit: 1
```

Command: git -c core.autocrlf=false add -- BUGFIX.md LAST_SESSION.md docs/MIGRATION_BASELINE.md docs/verification/recovery-runner.cjs docs/verification/check-recovery-env.cjs docs/verification/render-inspect.cjs docs/verification/close-recovery.cjs docs/verification/verify-recovery.cjs docs/verification/commit-recovery.cjs docs/verification/render-failed-deploy-2026-09-10.json docs/verification/staging-recovery-2026-09-10.md
```text

Exit: 0
```

Command: git diff --cached --check
```text
BUGFIX.md:316: trailing whitespace.
+- Missing-context scoped grants deny. PARTIAL is an existing scope whose previous granted semantics are retained; full scope migration remains v0.8.0.
BUGFIX.md:326: trailing whitespace.
+Public diagnostics found /login 200, /uploads/anything.pdf 404 and /api/tasks 307 instead of required 401 JSON. No password input appears in server HTML; client rendering was not verified. Wrong-secret login and actual recovery deploy tests are blocked. The recovery commit remains local as explicitly required when Step 4 does not pass.
LAST_SESSION.md:91: trailing whitespace.
+STAGING: partial — Render OAuth incomplete and required shell credentials unavailable; verification did not pass.
docs/MIGRATION_BASELINE.md:44: trailing whitespace.
+
docs/MIGRATION_BASELINE.md:69: trailing whitespace.
+The planned local dev-login-secret file is docs/backups/.dev-login-secret.local and is ignored by Git. It has not been created; no new secret was generated or uploaded.
docs/verification/recovery-runner.cjs:12: trailing whitespace.
+console.log(out); console.log('Exit:',r.status); process.exitCode=r.status||0;
docs/verification/staging-recovery-2026-09-10.md:53: trailing whitespace.
+2026-09-09T20:47:36.507701003Z
docs/verification/staging-recovery-2026-09-10.md:55: trailing whitespace.
+2026-09-09T20:47:36.507745099Z
docs/verification/staging-recovery-2026-09-10.md:58: trailing whitespace.
+2026-09-09T20:47:36.710004363Z
docs/verification/staging-recovery-2026-09-10.md:60: trailing whitespace.
+2026-09-09T20:47:36.710036122Z
docs/verification/staging-recovery-2026-09-10.md:63: trailing whitespace.
+2026-09-09T20:47:36.710040281Z
docs/verification/staging-recovery-2026-09-10.md:66: trailing whitespace.
+2026-09-09T20:47:36.71004487Z
docs/verification/staging-recovery-2026-09-10.md:70: trailing whitespace.
+2026-09-09T20:47:37.575008698Z
docs/verification/staging-recovery-2026-09-10.md:77: trailing whitespace.
+2026-09-09T20:47:38.132926004Z
docs/verification/staging-recovery-2026-09-10.md:81: trailing whitespace.
+2026-09-09T20:47:38.132941852Z
docs/verification/staging-recovery-2026-09-10.md:83: trailing whitespace.
+2026-09-09T20:47:38.132959511Z
docs/verification/staging-recovery-2026-09-10.md:85: trailing whitespace.
+2026-09-09T20:47:38.132962346Z
docs/verification/staging-recovery-2026-09-10.md:91: trailing whitespace.
+2026-09-09T20:47:38.941131255Z
docs/verification/staging-recovery-2026-09-10.md:94: trailing whitespace.
+2026-09-09T20:47:39.176629261Z
docs/verification/staging-recovery-2026-09-10.md:96: trailing whitespace.
+2026-09-09T20:47:39.176654422Z
docs/verification/staging-recovery-2026-09-10.md:99: trailing whitespace.
+2026-09-09T20:47:39.355401168Z
docs/verification/staging-recovery-2026-09-10.md:101: trailing whitespace.
+2026-09-09T20:47:39.355405959Z
docs/verification/staging-recovery-2026-09-10.md:103: trailing whitespace.
+2026-09-09T20:47:39.355409326Z
docs/verification/staging-recovery-2026-09-10.md:105: trailing whitespace.
+2026-09-09T20:47:39.355412402Z
docs/verification/staging-recovery-2026-09-10.md:108: trailing whitespace.
+2026-09-09T20:47:39.355416686Z
docs/verification/staging-recovery-2026-09-10.md:110: trailing whitespace.
+2026-09-09T20:47:39.355420006Z
docs/verification/staging-recovery-2026-09-10.md:111: trailing whitespace.
+2026-09-09T20:47:39.355421085Z
docs/verification/staging-recovery-2026-09-10.md:138: trailing whitespace.
+Missing closing ')' in expression.
docs/verification/staging-recovery-2026-09-10.md:139: trailing whitespace.
+    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
docs/verification/staging-recovery-2026-09-10.md:140: trailing whitespace.
+    + FullyQualifiedErrorId : MissingEndParenthesisInExpression
docs/verification/staging-recovery-2026-09-10.md:141: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:151: trailing whitespace.
+# v0.7.0 migration and storage cutover
docs/verification/staging-recovery-2026-09-10.md:152: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:153: trailing whitespace.
+Status: staging recovery attempted 2026-09-09/10; blocked before database reconciliation because the required process credentials are absent and Render OAuth is incomplete. No remote database commands were executed by the agent.
docs/verification/staging-recovery-2026-09-10.md:154: trailing whitespace.
+Part A is confirmed by Ahmad in the invocation and docs/backups/PART_A_2026-09.md. Backup artifacts and restoration remain operator evidence, not independently verified here.
docs/verification/staging-recovery-2026-09-10.md:155: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:156: trailing whitespace.
+## Command conventions
docs/verification/staging-recovery-2026-09-10.md:157: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:158: trailing whitespace.
+Use the installed Prisma 6 CLI: `node node_modules/prisma/build/index.js`, or `npm run db:diff -- ...`. On Windows set environment variables in the current PowerShell process (`$env:DATABASE_URL = ...`); never paste a real URL into committed documentation or logs. Use the copied database for rehearsals. `migrate status` is a history check; `migrate diff --exit-code` is the schema comparison (0 empty, 2 different).
docs/verification/staging-recovery-2026-09-10.md:159: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:160: trailing whitespace.
+## Part A â€” BEFORE the first push
docs/verification/staging-recovery-2026-09-10.md:161: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:162: trailing whitespace.
+1. Optionally suspend Render automatic deployment during the window. Agent does not change Render settings.
docs/verification/staging-recovery-2026-09-10.md:163: trailing whitespace.
+2. Full `pg_dump` and `pg_dump --schema-only` of staging BEFORE v0.7.0 additions; copy all existing `public/uploads` files off the old instance with SHA-256 checksums. Record dump filename, size, capture time and checksum-manifest filename in the backup record. This is also necessary if files are currently on ephemeral storage.
docs/verification/staging-recovery-2026-09-10.md:164: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:165: trailing whitespace.
+## Part B â€” disposable local rehearsals
docs/verification/staging-recovery-2026-09-10.md:166: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:167: trailing whitespace.
+3. Restore the pre-change dump to a disposable PostgreSQL database. Compare it to `prisma/.baseline/schema.original.prisma` using `migrate diff --from-url <copy> --to-schema-datamodel prisma/.baseline/schema.original.prisma --exit-code`. Inspect the schema-only dump for unmanaged views, triggers, extensions and indexes. Resolve baseline discrepancies; never erase them with a reset.
docs/verification/staging-recovery-2026-09-10.md:168: trailing whitespace.
+4. Clean install: empty database â†’ `npm run db:migrate` (both migrations) â†’ `npm run db:seed:reference` â†’ app boot. This was tested on local PostgreSQL 18.4; see verification logs. Restore of Ahmad's actual dump is still manual.
docs/verification/staging-recovery-2026-09-10.md:169: trailing whitespace.
+5. Already-updated rehearsal: restore the original dump; run the guarded `npm run db:push:local` on the loopback copy to simulate the legacy dashboard command; compare to the UPDATED schema with `--exit-code` and require 0. Then run `migrate resolve --applied 0_init` and `migrate resolve --applied 20260909000000_v070_baseline_additions`; `migrate status` must be clean. Copy backup files into the scratch app's `public/uploads`; run upload migration dry-run â†’ apply â†’ verify.
docs/verification/staging-recovery-2026-09-10.md:170: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:171: trailing whitespace.
+## Part C â€” staging reconciliation after the first auto-deploy
docs/verification/staging-recovery-2026-09-10.md:172: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:173: trailing whitespace.
+SUPERSEDED ASSUMPTION: the implementation prompt said the dashboard explicitly invoked schema push and prisma/seed.ts. The recovery report instead describes migrate deploy attempting 0_init and failing P3018. The exact dashboard command has not been fetched because Render OAuth is incomplete. That path now reaches a reference-only compatibility seed. Repository build and render-build scripts do not mutate the DB. Verify the actual dashboard command: if it only invokes npm run build/render-build, it will NOT apply new columns; complete migrations with the operator before serving the new code. Do not assume a successful remote deployment.
docs/verification/staging-recovery-2026-09-10.md:174: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:175: trailing whitespace.
+6. Compare staging against updated `prisma/schema.prisma`: `migrate diff --from-url <staging> --to-schema-datamodel prisma/schema.prisma --exit-code`. Require 0. IF NOT EXISTS avoids duplicate objects but cannot validate their types/constraints. If differences remain, stop reconciliation and resolve them explicitly.
docs/verification/staging-recovery-2026-09-10.md:176: trailing whitespace.
+7. Only on exact agreement, mark `0_init` and `20260909000000_v070_baseline_additions` applied using `migrate resolve --applied ...`; check `migrate status`.
docs/verification/staging-recovery-2026-09-10.md:177: trailing whitespace.
+8. Verify paid Render service plan and an attached persistent disk. Set `UPLOAD_DIR` to its absolute mounted path. Set a signing secret of at least 32 UTF-8 bytes, `DEV_LOGIN_PICKER_ENABLED=true`, a separate `DEV_LOGIN_SECRET`, and `STAGING_BASIC_AUTH=user:password`. Picker and shared credentials are seed-data testing only. Leave demo/reset flags unset on shared staging. NEXT_PUBLIC_APP_ENV controls presentation only.
docs/verification/staging-recovery-2026-09-10.md:178: trailing whitespace.
+9. File migration must run in the service shell with access to its disk, not in pre-deploy compute. If the old ephemeral files no longer exist on the new instance, restore them from Part A into `public/uploads` first; the URL denial remains active. Run:
docs/verification/staging-recovery-2026-09-10.md:179: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:180: trailing whitespace.
+   ```text
docs/verification/staging-recovery-2026-09-10.md:181: trailing whitespace.
+   node node_modules/tsx/dist/cli.mjs scripts/migrate-uploads.ts --dry-run
docs/verification/staging-recovery-2026-09-10.md:182: trailing whitespace.
+   node node_modules/tsx/dist/cli.mjs scripts/migrate-uploads.ts --apply
docs/verification/staging-recovery-2026-09-10.md:183: trailing whitespace.
+   node node_modules/tsx/dist/cli.mjs scripts/migrate-uploads.ts --verify
docs/verification/staging-recovery-2026-09-10.md:184: trailing whitespace.
+   ```
docs/verification/staging-recovery-2026-09-10.md:185: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:186: trailing whitespace.
+   Copy operations are exclusive, checksummed, and precede conditional database updates. The ignored progress log is a recovery hint, never authority over database mappings. Preserve sources and orphan copies until verification. Source removal is an operator action after verified backup; the script never deletes files.
docs/verification/staging-recovery-2026-09-10.md:187: trailing whitespace.
+10. Set dashboard build command to `npm ci && npm run build` (dependency install plus mutation-free build), and paid-instance pre-deploy command to `npm run release` (migrations plus reference seed). Repository render.yaml uses the same build; its paid pre-deploy setting is documented pending actual plan verification. Do not put file migration in pre-deploy.
docs/verification/staging-recovery-2026-09-10.md:188: trailing whitespace.
+11. Verify picker secret, forged cookie rejection, `/uploads/<real filename>` 404 with and without a session, authenticated download checksums against Part A, Employee scope, and a matrix change surviving a redeploy.
docs/verification/staging-recovery-2026-09-10.md:189: trailing whitespace.
+12. Restore rehearsal for pilot entry: restore dump AND files into scratch storage, boot matching pre-change code OR migrate the restored DB before booting v0.7.0, and verify business-record counts and sample download checksums. Record artifact identifiers, elapsed time, recovery steps and result. This is distinct from the synthetic local integration tests.
docs/verification/staging-recovery-2026-09-10.md:190: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:191: trailing whitespace.
+## Recovery
docs/verification/staging-recovery-2026-09-10.md:192: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:193: trailing whitespace.
+Stop writes, preserve the current database and file copies, restore the matching database backup and sources, run schema reconciliation for the selected application revision, and rerun the resumable file migration. Do not blindly mark partially applied migrations complete. No automatic rollback or source deletion is performed.
docs/verification/staging-recovery-2026-09-10.md:194: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:195: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:196: trailing whitespace.
+## Part C recovery status â€” 2026-09-09/10
docs/verification/staging-recovery-2026-09-10.md:197: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:198: trailing whitespace.
+Evidence: [sanitized command record](verification/staging-recovery-2026-09-09.md). The recovery instruction supersedes the earlier already-updated-schema assumption. Do not mark additions applied until the actual database state is verified.
docs/verification/staging-recovery-2026-09-10.md:199: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:200: trailing whitespace.
+| Recovery task | Done? | Evidence / next required condition |
docs/verification/staging-recovery-2026-09-10.md:201: trailing whitespace.
+|---|---|---|
docs/verification/staging-recovery-2026-09-10.md:202: trailing whitespace.
+| Configure Render MCP URL/client | Configuration added | codex mcp add completed registration; OAuth did not complete; mcp list reports Not logged in |
docs/verification/staging-recovery-2026-09-10.md:203: trailing whitespace.
+| Select workspace; fetch service/database/failed-deploy log | No | No authenticated Render MCP connection; service plan/build/pre-deploy/auto-deploy/disk are unknown |
docs/verification/staging-recovery-2026-09-10.md:204: trailing whitespace.
+| 2a: resolve 0_init rolled-back | No | DATABASE_URL absent in process, user and machine environments; no dotenv fallback allowed |
docs/verification/staging-recovery-2026-09-10.md:205: trailing whitespace.
+| 2b: compare database with original snapshot | No | Depends on 2a and authorized shell URL; any difference stops remaining database work |
docs/verification/staging-recovery-2026-09-10.md:206: trailing whitespace.
+| 2c: resolve 0_init applied | No | Original-schema agreement not established |
docs/verification/staging-recovery-2026-09-10.md:207: trailing whitespace.
+| 2d: apply additions with migrate deploy | No | Baseline not reconciled |
docs/verification/staging-recovery-2026-09-10.md:208: trailing whitespace.
+| 2e-f: clean status and empty updated-schema diff | No | No database access; never assumed clean |
docs/verification/staging-recovery-2026-09-10.md:209: trailing whitespace.
+| 2g: reference-only seed | Entry point confirmed; not run | package script selects reference branch, which calls seedReference only |
docs/verification/staging-recovery-2026-09-10.md:210: trailing whitespace.
+| Env variables, secret generation and build/pre-deploy updates | No | OAuth incomplete and RENDER_API_KEY absent; existing settings preserved |
docs/verification/staging-recovery-2026-09-10.md:211: trailing whitespace.
+| Trigger deployment and capture logs | No | Reconciliation/configuration prerequisites failed |
docs/verification/staging-recovery-2026-09-10.md:212: trailing whitespace.
+| Post-deployment HTTP verification | No | No recovery deploy; diagnostic GET /api/tasks currently returns 307, not required 401 JSON |
docs/verification/staging-recovery-2026-09-10.md:213: trailing whitespace.
+| Private disk and files, migration/checksum evidence, restore rehearsal | No | Remain unchanged/manual; no disk or plan changes authorized |
docs/verification/staging-recovery-2026-09-10.md:214: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:215: trailing whitespace.
+When authenticated access and process credentials become available, execute exactly: `node .\node_modules\prisma\build\index.js migrate resolve --rolled-back 0_init`; `migrate diff --from-url $env:DATABASE_URL --to-schema-datamodel prisma/.baseline/schema.original.prisma --exit-code` (require exit 0); `migrate resolve --applied 0_init`; `migrate deploy`; `migrate status`; updated-schema diff with `--exit-code` (require exit 0); then `npm run db:seed:reference`. Every Prisma subcommand uses that same explicit Node CLI path. Capture/redact all output in memory before logging; never print the expanded URL. Stop on any failed prerequisite or nonempty original-schema diff.
docs/verification/staging-recovery-2026-09-10.md:216: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:217: trailing whitespace.
+The current recovery request specifies Build Command `npm run build` and Pre-Deploy Command `npm run release` if supported. If unsupported, its explicitly accepted staging exception is Build Command `npm run build && npm run release`; document the exception in SECURITY.md only when that configuration is actually selected. Do not change plan/disk/auto-deploy. These settings have NOT been applied here.
docs/verification/staging-recovery-2026-09-10.md:218: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:219: trailing whitespace.
+The planned local dev-login-secret file is docs/backups/.dev-login-secret.local and is ignored by Git. It has not been created; no new secret was generated or uploaded.
docs/verification/staging-recovery-2026-09-10.md:220: trailing whitespace.
+# Part A backup confirmation
docs/verification/staging-recovery-2026-09-10.md:221: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:222: trailing whitespace.
+Recorded: 2026-09-09
docs/verification/staging-recovery-2026-09-10.md:223: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:224: trailing whitespace.
+Ahmad confirmed in the invocation message:
docs/verification/staging-recovery-2026-09-10.md:225: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:226: trailing whitespace.
+PART A BACKUP DONE: yes
docs/verification/staging-recovery-2026-09-10.md:227: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:228: trailing whitespace.
+This records the user confirmation accepted by the v5 prompt's push prerequisite. Backup contents and restore success have not been independently verified.
docs/verification/staging-recovery-2026-09-10.md:229: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:230: trailing whitespace.
+- Backup completion date/time: not supplied separately.
docs/verification/staging-recovery-2026-09-10.md:231: trailing whitespace.
+- Dump filename and size: not supplied.
docs/verification/staging-recovery-2026-09-10.md:232: trailing whitespace.
+- Uploads checksum-list filename: not supplied.
docs/verification/staging-recovery-2026-09-10.md:233: trailing whitespace.
+- Restore rehearsal: remains a separate pilot entry gate.
docs/verification/staging-recovery-2026-09-10.md:234: trailing whitespace.
+{
docs/verification/staging-recovery-2026-09-10.md:235: trailing whitespace.
+  "name": "an-law-firm",
docs/verification/staging-recovery-2026-09-10.md:236: trailing whitespace.
+  "version": "0.7.0",
docs/verification/staging-recovery-2026-09-10.md:237: trailing whitespace.
+  "private": true,
docs/verification/staging-recovery-2026-09-10.md:238: trailing whitespace.
+  "engines": {
docs/verification/staging-recovery-2026-09-10.md:239: trailing whitespace.
+    "node": ">=20.0.0"
docs/verification/staging-recovery-2026-09-10.md:240: trailing whitespace.
+  },
docs/verification/staging-recovery-2026-09-10.md:241: trailing whitespace.
+  "scripts": {
docs/verification/staging-recovery-2026-09-10.md:242: trailing whitespace.
+    "dev": "node node_modules/next/dist/bin/next dev",
docs/verification/staging-recovery-2026-09-10.md:243: trailing whitespace.
+    "build": "node node_modules/prisma/build/index.js generate && node node_modules/next/dist/bin/next build",
docs/verification/staging-recovery-2026-09-10.md:244: trailing whitespace.
+    "start": "node node_modules/next/dist/bin/next start",
docs/verification/staging-recovery-2026-09-10.md:245: trailing whitespace.
+    "lint": "node node_modules/next/dist/bin/next lint",
docs/verification/staging-recovery-2026-09-10.md:246: trailing whitespace.
+    "db:generate": "node node_modules/prisma/build/index.js generate",
docs/verification/staging-recovery-2026-09-10.md:247: trailing whitespace.
+    "db:seed": "npm run db:seed:reference",
docs/verification/staging-recovery-2026-09-10.md:248: trailing whitespace.
+    "db:studio": "node node_modules/prisma/build/index.js studio",
docs/verification/staging-recovery-2026-09-10.md:249: trailing whitespace.
+    "render-build": "node node_modules/prisma/build/index.js generate && node node_modules/next/dist/bin/next build",
docs/verification/staging-recovery-2026-09-10.md:250: trailing whitespace.
+    "next": "node node_modules/next/dist/bin/next",
docs/verification/staging-recovery-2026-09-10.md:251: trailing whitespace.
+    "test": "node node_modules/vitest/vitest.mjs",
docs/verification/staging-recovery-2026-09-10.md:252: trailing whitespace.
+    "test:ui": "node node_modules/vitest/vitest.mjs --ui",
docs/verification/staging-recovery-2026-09-10.md:253: trailing whitespace.
+    "test:run": "node node_modules/vitest/vitest.mjs run",
docs/verification/staging-recovery-2026-09-10.md:254: trailing whitespace.
+    "db:migrate": "node node_modules/prisma/build/index.js migrate deploy",
docs/verification/staging-recovery-2026-09-10.md:255: trailing whitespace.
+    "db:diff": "node node_modules/prisma/build/index.js migrate diff",
docs/verification/staging-recovery-2026-09-10.md:256: trailing whitespace.
+    "db:push:local": "node scripts/db-push-local.cjs",
docs/verification/staging-recovery-2026-09-10.md:257: trailing whitespace.
+    "release": "npm run db:migrate && npm run db:seed:reference",
docs/verification/staging-recovery-2026-09-10.md:258: trailing whitespace.
+    "db:seed:reference": "node node_modules/tsx/dist/cli.mjs prisma/seed/cli.ts reference",
docs/verification/staging-recovery-2026-09-10.md:259: trailing whitespace.
+    "db:seed:demo": "node node_modules/tsx/dist/cli.mjs prisma/seed/cli.ts demo",
docs/verification/staging-recovery-2026-09-10.md:260: trailing whitespace.
+    "db:policy:reset": "node node_modules/tsx/dist/cli.mjs prisma/seed/cli.ts reset",
docs/verification/staging-recovery-2026-09-10.md:261: trailing whitespace.
+    "typecheck": "node node_modules/typescript/bin/tsc --noEmit"
docs/verification/staging-recovery-2026-09-10.md:262: trailing whitespace.
+  },
docs/verification/staging-recovery-2026-09-10.md:263: trailing whitespace.
+  "prisma": {
docs/verification/staging-recovery-2026-09-10.md:264: trailing whitespace.
+    "seed": "node node_modules/tsx/dist/cli.mjs prisma/seed.ts"
docs/verification/staging-recovery-2026-09-10.md:265: trailing whitespace.
+  },
docs/verification/staging-recovery-2026-09-10.md:266: trailing whitespace.
+  "dependencies": {
docs/verification/staging-recovery-2026-09-10.md:267: trailing whitespace.
+    "@base-ui/react": "^1.3.0",
docs/verification/staging-recovery-2026-09-10.md:268: trailing whitespace.
+    "@dnd-kit/core": "^6.3.1",
docs/verification/staging-recovery-2026-09-10.md:269: trailing whitespace.
+    "@dnd-kit/sortable": "^10.0.0",
docs/verification/staging-recovery-2026-09-10.md:270: trailing whitespace.
+    "@dnd-kit/utilities": "^3.2.2",
docs/verification/staging-recovery-2026-09-10.md:271: trailing whitespace.
+    "@prisma/client": "^6.19.3",
docs/verification/staging-recovery-2026-09-10.md:272: trailing whitespace.
+    "@radix-ui/react-select": "^2.2.6",
docs/verification/staging-recovery-2026-09-10.md:273: trailing whitespace.
+    "@radix-ui/react-slot": "^1.2.4",
docs/verification/staging-recovery-2026-09-10.md:274: trailing whitespace.
+    "class-variance-authority": "^0.7.1",
docs/verification/staging-recovery-2026-09-10.md:275: trailing whitespace.
+    "clsx": "^2.1.1",
docs/verification/staging-recovery-2026-09-10.md:276: trailing whitespace.
+    "cmdk": "^1.1.1",
docs/verification/staging-recovery-2026-09-10.md:277: trailing whitespace.
+    "date-fns": "^4.1.0",
docs/verification/staging-recovery-2026-09-10.md:278: trailing whitespace.
+    "lucide-react": "^1.7.0",
docs/verification/staging-recovery-2026-09-10.md:279: trailing whitespace.
+    "next": "14.2.15",
docs/verification/staging-recovery-2026-09-10.md:280: trailing whitespace.
+    "next-themes": "^0.4.6",
docs/verification/staging-recovery-2026-09-10.md:281: trailing whitespace.
+    "prisma": "^6.19.3",
docs/verification/staging-recovery-2026-09-10.md:282: trailing whitespace.
+    "react": "^18",
docs/verification/staging-recovery-2026-09-10.md:283: trailing whitespace.
+    "react-day-picker": "^9.14.0",
docs/verification/staging-recovery-2026-09-10.md:284: trailing whitespace.
+    "react-dom": "^18",
docs/verification/staging-recovery-2026-09-10.md:285: trailing whitespace.
+    "recharts": "^3.8.1",
docs/verification/staging-recovery-2026-09-10.md:286: trailing whitespace.
+    "server-only": "^0.0.1",
docs/verification/staging-recovery-2026-09-10.md:287: trailing whitespace.
+    "shadcn": "^4.1.2",
docs/verification/staging-recovery-2026-09-10.md:288: trailing whitespace.
+    "sonner": "^2.0.7",
docs/verification/staging-recovery-2026-09-10.md:289: trailing whitespace.
+    "tailwind-merge": "^3.5.0",
docs/verification/staging-recovery-2026-09-10.md:290: trailing whitespace.
+    "tailwindcss-animate": "^1.0.7",
docs/verification/staging-recovery-2026-09-10.md:291: trailing whitespace.
+    "tailwindcss-rtl": "^0.9.0",
docs/verification/staging-recovery-2026-09-10.md:292: trailing whitespace.
+    "tsx": "^4.21.0",
docs/verification/staging-recovery-2026-09-10.md:293: trailing whitespace.
+    "tw-animate-css": "^1.4.0"
docs/verification/staging-recovery-2026-09-10.md:294: trailing whitespace.
+  },
docs/verification/staging-recovery-2026-09-10.md:295: trailing whitespace.
+  "devDependencies": {
docs/verification/staging-recovery-2026-09-10.md:296: trailing whitespace.
+    "@testing-library/jest-dom": "^6.9.1",
docs/verification/staging-recovery-2026-09-10.md:297: trailing whitespace.
+    "@testing-library/react": "^16.3.2",
docs/verification/staging-recovery-2026-09-10.md:298: trailing whitespace.
+    "@types/node": "^20.19.39",
docs/verification/staging-recovery-2026-09-10.md:299: trailing whitespace.
+    "@types/react": "^18",
docs/verification/staging-recovery-2026-09-10.md:300: trailing whitespace.
+    "@types/react-dom": "^18",
docs/verification/staging-recovery-2026-09-10.md:301: trailing whitespace.
+    "@vitest/ui": "^4.1.5",
docs/verification/staging-recovery-2026-09-10.md:302: trailing whitespace.
+    "eslint": "^8",
docs/verification/staging-recovery-2026-09-10.md:303: trailing whitespace.
+    "eslint-config-next": "14.2.15",
docs/verification/staging-recovery-2026-09-10.md:304: trailing whitespace.
+    "jsdom": "^29.1.1",
docs/verification/staging-recovery-2026-09-10.md:305: trailing whitespace.
+    "postcss": "^8",
docs/verification/staging-recovery-2026-09-10.md:306: trailing whitespace.
+    "tailwindcss": "^3.4.1",
docs/verification/staging-recovery-2026-09-10.md:307: trailing whitespace.
+    "typescript": "^5",
docs/verification/staging-recovery-2026-09-10.md:308: trailing whitespace.
+    "vitest": "^4.1.5"
docs/verification/staging-recovery-2026-09-10.md:309: trailing whitespace.
+  }
docs/verification/staging-recovery-2026-09-10.md:310: trailing whitespace.
+}
docs/verification/staging-recovery-2026-09-10.md:311: trailing whitespace.
+# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.
docs/verification/staging-recovery-2026-09-10.md:312: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:313: trailing whitespace.
+# dependencies
docs/verification/staging-recovery-2026-09-10.md:314: trailing whitespace.
+/node_modules
docs/verification/staging-recovery-2026-09-10.md:315: trailing whitespace.
+/.pnp
docs/verification/staging-recovery-2026-09-10.md:316: trailing whitespace.
+.pnp.js
docs/verification/staging-recovery-2026-09-10.md:317: trailing whitespace.
+.yarn/install-state.gz
docs/verification/staging-recovery-2026-09-10.md:318: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:319: trailing whitespace.
+# testing
docs/verification/staging-recovery-2026-09-10.md:320: trailing whitespace.
+/coverage
docs/verification/staging-recovery-2026-09-10.md:321: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:322: trailing whitespace.
+# next.js
docs/verification/staging-recovery-2026-09-10.md:323: trailing whitespace.
+/.next/
docs/verification/staging-recovery-2026-09-10.md:324: trailing whitespace.
+/out/
docs/verification/staging-recovery-2026-09-10.md:325: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:326: trailing whitespace.
+# production
docs/verification/staging-recovery-2026-09-10.md:327: trailing whitespace.
+/build
docs/verification/staging-recovery-2026-09-10.md:328: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:329: trailing whitespace.
+# misc
docs/verification/staging-recovery-2026-09-10.md:330: trailing whitespace.
+.DS_Store
docs/verification/staging-recovery-2026-09-10.md:331: trailing whitespace.
+*.pem
docs/verification/staging-recovery-2026-09-10.md:332: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:333: trailing whitespace.
+# debug
docs/verification/staging-recovery-2026-09-10.md:334: trailing whitespace.
+npm-debug.log*
docs/verification/staging-recovery-2026-09-10.md:335: trailing whitespace.
+yarn-debug.log*
docs/verification/staging-recovery-2026-09-10.md:336: trailing whitespace.
+yarn-error.log*
docs/verification/staging-recovery-2026-09-10.md:337: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:338: trailing whitespace.
+# local env files â€” DO NOT commit .env (contains DATABASE_URL + secrets)
docs/verification/staging-recovery-2026-09-10.md:339: trailing whitespace.
+.env
docs/verification/staging-recovery-2026-09-10.md:340: trailing whitespace.
+.env.*
docs/verification/staging-recovery-2026-09-10.md:341: trailing whitespace.
+!.env.example
docs/verification/staging-recovery-2026-09-10.md:342: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:343: trailing whitespace.
+# vercel
docs/verification/staging-recovery-2026-09-10.md:344: trailing whitespace.
+.vercel
docs/verification/staging-recovery-2026-09-10.md:345: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:346: trailing whitespace.
+# typescript
docs/verification/staging-recovery-2026-09-10.md:347: trailing whitespace.
+*.tsbuildinfo
docs/verification/staging-recovery-2026-09-10.md:348: trailing whitespace.
+next-env.d.ts
docs/verification/staging-recovery-2026-09-10.md:349: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:350: trailing whitespace.
+# prisma local database
docs/verification/staging-recovery-2026-09-10.md:351: trailing whitespace.
+prisma/*.db
docs/verification/staging-recovery-2026-09-10.md:352: trailing whitespace.
+prisma/*.db-journal
docs/verification/staging-recovery-2026-09-10.md:353: trailing whitespace.
+prisma/*.db-wal
docs/verification/staging-recovery-2026-09-10.md:354: trailing whitespace.
+prisma/*.db-shm
docs/verification/staging-recovery-2026-09-10.md:355: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:356: trailing whitespace.
+.uploads/
docs/verification/staging-recovery-2026-09-10.md:357: trailing whitespace.
+.local-test/
docs/verification/staging-recovery-2026-09-10.md:358: trailing whitespace.
+scripts/migrate-uploads.progress.jsonl
docs/verification/staging-recovery-2026-09-10.md:359: trailing whitespace.
+.continue/
docs/verification/staging-recovery-2026-09-10.md:360: trailing whitespace.
+.serena/
docs/verification/staging-recovery-2026-09-10.md:361: trailing whitespace.
+.vscode/
docs/verification/staging-recovery-2026-09-10.md:362: trailing whitespace.
+.idea/
docs/verification/staging-recovery-2026-09-10.md:363: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:364: trailing whitespace.
+public/uploads/test-deny.pdf
docs/verification/staging-recovery-2026-09-10.md:365: trailing whitespace.
+.claude/
docs/verification/staging-recovery-2026-09-10.md:366: trailing whitespace.
+docs/backups/.dev-login-secret.local
docs/verification/staging-recovery-2026-09-10.md:381: trailing whitespace.
+True
docs/verification/staging-recovery-2026-09-10.md:382: trailing whitespace.
+True
docs/verification/staging-recovery-2026-09-10.md:392: trailing whitespace.
+import { PrismaClient } from "@prisma/client";
docs/verification/staging-recovery-2026-09-10.md:393: trailing whitespace.
+import { seedReference } from "./reference";
docs/verification/staging-recovery-2026-09-10.md:394: trailing whitespace.
+import { seedDemo } from "./demo";
docs/verification/staging-recovery-2026-09-10.md:395: trailing whitespace.
+import { resetPolicy } from "./reset-policy";
docs/verification/staging-recovery-2026-09-10.md:396: trailing whitespace.
+const db = new PrismaClient();
docs/verification/staging-recovery-2026-09-10.md:397: trailing whitespace.
+async function main() {
docs/verification/staging-recovery-2026-09-10.md:398: trailing whitespace.
+  switch (process.argv[2]) {
docs/verification/staging-recovery-2026-09-10.md:399: trailing whitespace.
+    case "reference": await seedReference(db); break;
docs/verification/staging-recovery-2026-09-10.md:400: trailing whitespace.
+    case "demo": { const result = await seedDemo(db); console.log(`Demo seed finished; retained audit users: ${result.retained.length}`); break; }
docs/verification/staging-recovery-2026-09-10.md:401: trailing whitespace.
+    case "reset": await resetPolicy(db, process.env.POLICY_RESET_ACTOR ?? ""); break;
docs/verification/staging-recovery-2026-09-10.md:402: trailing whitespace.
+    default: throw new Error("Expected reference, demo, or reset");
docs/verification/staging-recovery-2026-09-10.md:403: trailing whitespace.
+  }
docs/verification/staging-recovery-2026-09-10.md:404: trailing whitespace.
+}
docs/verification/staging-recovery-2026-09-10.md:405: trailing whitespace.
+main().catch((e: unknown) => { console.error(e instanceof Error ? e.message : "Seed failed"); process.exitCode = 1; }).finally(() => db.$disconnect());
docs/verification/staging-recovery-2026-09-10.md:406: trailing whitespace.
+import type { PrismaClient } from "@prisma/client";
docs/verification/staging-recovery-2026-09-10.md:407: trailing whitespace.
+import { PERMISSIONS, ROLE_MATRIX, ROLES_DEF } from "./policy";
docs/verification/staging-recovery-2026-09-10.md:408: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:409: trailing whitespace.
+export async function seedReference(db: PrismaClient) {
docs/verification/staging-recovery-2026-09-10.md:410: trailing whitespace.
+  for (const d of [{ name: "Litigation", nameAr: "Ø§Ù„ØªÙ‚Ø§Ø¶ÙŠ" }, { name: "Corporate", nameAr: "Ø§Ù„Ø´Ø±ÙƒØ§Øª" }]) {
docs/verification/staging-recovery-2026-09-10.md:411: trailing whitespace.
+    await db.department.upsert({ where: { name: d.name }, create: d, update: {} });
docs/verification/staging-recovery-2026-09-10.md:412: trailing whitespace.
+  }
docs/verification/staging-recovery-2026-09-10.md:413: trailing whitespace.
+  const roles: Record<string, string> = {};
docs/verification/staging-recovery-2026-09-10.md:414: trailing whitespace.
+  for (const role of ROLES_DEF) {
docs/verification/staging-recovery-2026-09-10.md:415: trailing whitespace.
+    const row = await db.role.upsert({ where: { name: role.name }, create: role,
docs/verification/staging-recovery-2026-09-10.md:416: trailing whitespace.
+      update: { nameAr: role.nameAr, isLocked: role.isLocked } });
docs/verification/staging-recovery-2026-09-10.md:417: trailing whitespace.
+    roles[role.name] = row.id;
docs/verification/staging-recovery-2026-09-10.md:418: trailing whitespace.
+  }
docs/verification/staging-recovery-2026-09-10.md:419: trailing whitespace.
+  for (const definition of PERMISSIONS) {
docs/verification/staging-recovery-2026-09-10.md:420: trailing whitespace.
+    const permission = await db.permission.upsert({ where: { key: definition.key }, create: definition,
docs/verification/staging-recovery-2026-09-10.md:421: trailing whitespace.
+      update: { category: definition.category, description: definition.description, descriptionAr: definition.descriptionAr } });
docs/verification/staging-recovery-2026-09-10.md:422: trailing whitespace.
+    for (const role of ROLES_DEF) {
docs/verification/staging-recovery-2026-09-10.md:423: trailing whitespace.
+      const grant = ROLE_MATRIX[role.name][definition.key] ?? { granted: false };
docs/verification/staging-recovery-2026-09-10.md:424: trailing whitespace.
+      const policy = { granted: grant.granted, scope: grant.scope ?? "ALL", isLocked: grant.isLocked ?? false, lockedDirection: grant.lockedDirection ?? null };
docs/verification/staging-recovery-2026-09-10.md:425: trailing whitespace.
+      await db.rolePermission.upsert({
docs/verification/staging-recovery-2026-09-10.md:426: trailing whitespace.
+        where: { roleId_permissionId: { roleId: roles[role.name], permissionId: permission.id } },
docs/verification/staging-recovery-2026-09-10.md:427: trailing whitespace.
+        create: { roleId: roles[role.name], permissionId: permission.id, ...policy },
docs/verification/staging-recovery-2026-09-10.md:428: trailing whitespace.
+        update: grant.isLocked && ["PARTNER", "SYSTEM_ADMIN"].includes(role.name) ? policy : {},
docs/verification/staging-recovery-2026-09-10.md:429: trailing whitespace.
+      });
docs/verification/staging-recovery-2026-09-10.md:430: trailing whitespace.
+    }
docs/verification/staging-recovery-2026-09-10.md:431: trailing whitespace.
+  }
docs/verification/staging-recovery-2026-09-10.md:432: trailing whitespace.
+  await db.reportConfig.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} });
docs/verification/staging-recovery-2026-09-10.md:433: trailing whitespace.
+  for (const [legacy, current] of Object.entries({ PARTNER: "PARTNER", ADMIN: "SYSTEM_ADMIN", MANAGER: "DEPARTMENT_MANAGER", EMPLOYEE: "EMPLOYEE" })) {
docs/verification/staging-recovery-2026-09-10.md:434: trailing whitespace.
+    await db.user.updateMany({ where: { role: legacy, roleId: null }, data: { roleId: roles[current] } });
docs/verification/staging-recovery-2026-09-10.md:435: trailing whitespace.
+  }
docs/verification/staging-recovery-2026-09-10.md:436: trailing whitespace.
+  return roles;
docs/verification/staging-recovery-2026-09-10.md:437: trailing whitespace.
+}
docs/verification/staging-recovery-2026-09-10.md:499: trailing whitespace.
+# A&N LPMS â€” Bug Tracker
docs/verification/staging-recovery-2026-09-10.md:500: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:501: trailing whitespace.
+> Every bug goes here immediately when found. Nothing gets fixed from memory.
docs/verification/staging-recovery-2026-09-10.md:502: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:503: trailing whitespace.
+---
docs/verification/staging-recovery-2026-09-10.md:504: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:505: trailing whitespace.
+## How to Add a Bug
docs/verification/staging-recovery-2026-09-10.md:506: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:507: trailing whitespace.
+```
docs/verification/staging-recovery-2026-09-10.md:508: trailing whitespace.
+### BUG-XXX â€” [Short title]
docs/verification/staging-recovery-2026-09-10.md:509: trailing whitespace.
+- **Found by:** [Who]
docs/verification/staging-recovery-2026-09-10.md:510: trailing whitespace.
+- **Date:** YYYY-MM-DD
docs/verification/staging-recovery-2026-09-10.md:511: trailing whitespace.
+- **Module:** [e.g. Work Logs]
docs/verification/staging-recovery-2026-09-10.md:512: trailing whitespace.
+- **Steps to reproduce:** What to click/do to see the bug
docs/verification/staging-recovery-2026-09-10.md:513: trailing whitespace.
+- **Expected:** What should happen
docs/verification/staging-recovery-2026-09-10.md:514: trailing whitespace.
+- **Actual:** What happens instead
docs/verification/staging-recovery-2026-09-10.md:515: trailing whitespace.
+- **Priority:** Critical / High / Medium / Low
docs/verification/staging-recovery-2026-09-10.md:516: trailing whitespace.
+- **Status:** Open / In Progress / Fixed in vX.X.X
docs/verification/staging-recovery-2026-09-10.md:517: trailing whitespace.
+```
docs/verification/staging-recovery-2026-09-10.md:518: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:519: trailing whitespace.
+---
docs/verification/staging-recovery-2026-09-10.md:520: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:521: trailing whitespace.
+## ðŸ”´ Critical (System broken / data loss risk)
docs/verification/staging-recovery-2026-09-10.md:522: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:523: trailing whitespace.
+*(None)*
docs/verification/staging-recovery-2026-09-10.md:524: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:525: trailing whitespace.
+---
docs/verification/staging-recovery-2026-09-10.md:526: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:527: trailing whitespace.
+## ðŸŸ  High (Feature not working)
docs/verification/staging-recovery-2026-09-10.md:528: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:529: trailing whitespace.
+*(None)*
docs/verification/staging-recovery-2026-09-10.md:530: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:531: trailing whitespace.
+---
docs/verification/staging-recovery-2026-09-10.md:532: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:533: trailing whitespace.
+## ðŸŸ¡ Medium (Works but wrong)
docs/verification/staging-recovery-2026-09-10.md:534: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:535: trailing whitespace.
+*(None)*
docs/verification/staging-recovery-2026-09-10.md:536: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:537: trailing whitespace.
+---
docs/verification/staging-recovery-2026-09-10.md:538: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:539: trailing whitespace.
+## ðŸŸ¢ Low (Visual / minor)
docs/verification/staging-recovery-2026-09-10.md:540: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:541: trailing whitespace.
+*(None)*
docs/verification/staging-recovery-2026-09-10.md:542: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:543: trailing whitespace.
+---
docs/verification/staging-recovery-2026-09-10.md:544: trailing whitespace.
+- docs/MIGRATION_BASELINE.md:21 â€” Part C staging schema agreement before resolving both migrations; verify actual dashboard command and paid plan, persistent disk, secrets, file migration and checksum verification; then switch dashboard build/release commands.
docs/verification/staging-recovery-2026-09-10.md:545: trailing whitespace.
+- SECURITY.md:147 â€” Next.js 14.2.15 audit/advisory remains open by explicit scope. Close in v0.8.0 before real client data enters any internet-reachable environment. Ahmad accepts this push's staging auto-deploy only while staging contains seed data.
docs/verification/staging-recovery-2026-09-10.md:546: trailing whitespace.
+- SECURITY.md:149 â€” System Admin selector testing exception is documented only; default-off implementation in v0.8.0 and disabled before pilot.
docs/verification/staging-recovery-2026-09-10.md:547: trailing whitespace.
+- docs/AUTHZ_INVENTORY.md:1 â€” legacy/auth-only route authorization remains for v0.8.0 DB-backed enforcement.
docs/verification/staging-recovery-2026-09-10.md:548: trailing whitespace.
+- This file's Antigravity checklist â€” visual/staging checks and separate implementation review remain outstanding. Pilot entry requires evidence for all eight gates.
docs/verification/staging-recovery-2026-09-10.md:549: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:550: trailing whitespace.
+## Assumptions and bounded implementation choices
docs/verification/staging-recovery-2026-09-10.md:551: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:552: trailing whitespace.
+The dashboard still explicitly invokes schema push plus prisma/seed.ts as stated in the prompt; the operator must verify this in Part C. Repository build scripts alone cannot apply additions. No successful remote execution is assumed.
docs/verification/staging-recovery-2026-09-10.md:553: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:554: trailing whitespace.
+Rows in models without isDemo are protected; actual incoming relations come from Prisma DMMF. Demo fixtures use synthetic example.invalid identities and avoid protected department/team manager references. Existing user department membership is preserved; only null roleId values receive the specified legacy backfill. PARTIAL scope retains existing granted behavior; missing required scope context denies. Server-generated storage identifiers use a c-prefixed 24-hex random token. The legacy authorization matrix remains intentionally in place until v0.8.0. None of these choices adds task approvals, permission keys, a System Admin feature flag or a new product flow.
docs/verification/staging-recovery-2026-09-10.md:555: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:556: trailing whitespace.
+PowerShell lifecycle shell configuration is process-local to this Windows A&N path; Linux Render keeps its normal shell. Explicit Prisma generation avoids relying on postinstall side effects. No global npm configuration changed.
docs/verification/staging-recovery-2026-09-10.md:557: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:558: trailing whitespace.
+## Ahmad's next actions
docs/verification/staging-recovery-2026-09-10.md:559: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:560: trailing whitespace.
+1. Part A is already confirmed; add the missing backup artifact identifiers for traceability.
docs/verification/staging-recovery-2026-09-10.md:561: trailing whitespace.
+2. Follow runbook Parts Bâ€“C, including paid-plan/disk verification, auth environment settings and recoverable file migration. Keep source files until checksum/restore evidence is accepted.
docs/verification/staging-recovery-2026-09-10.md:562: trailing whitespace.
+3. Complete the Antigravity staging checks below and request the separate implementation review. Do not admit real users/client data before all pilot gates pass.
docs/verification/staging-recovery-2026-09-10.md:563: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:564: trailing whitespace.
+## Antigravity checklist
docs/verification/staging-recovery-2026-09-10.md:565: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:566: trailing whitespace.
+- [ ] Picker requires the secret; unavailable state is localized when disabled.
docs/verification/staging-recovery-2026-09-10.md:567: trailing whitespace.
+- [ ] Forged cookie is rejected.
docs/verification/staging-recovery-2026-09-10.md:568: trailing whitespace.
+- [ ] An actual /uploads/<file> URL returns 404 with and without a session.
docs/verification/staging-recovery-2026-09-10.md:569: trailing whitespace.
+- [ ] Downloads require login and authorization; compare file checksum with the backup.
docs/verification/staging-recovery-2026-09-10.md:570: trailing whitespace.
+- [ ] An editable matrix change survives redeploy/reference seeding.
docs/verification/staging-recovery-2026-09-10.md:571: trailing whitespace.
+- [ ] Employee cannot list/download unassigned-case files.
docs/verification/staging-recovery-2026-09-10.md:572: trailing whitespace.
+- [ ] Employee can read but cannot delete assigned-case files.
docs/verification/staging-recovery-2026-09-10.md:573: trailing whitespace.
+- [ ] Arabic/English login layout and password field render correctly.
docs/verification/staging-recovery-2026-09-10.md:574: trailing whitespace.
+- [ ] Separate implementation review passes.
docs/verification/staging-recovery-2026-09-10.md:575: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:576: trailing whitespace.
+STATUS: ready for implementation review
docs/verification/staging-recovery-2026-09-10.md:577: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:578: trailing whitespace.
+## Staging recovery â€” 2026-09-09/10
docs/verification/staging-recovery-2026-09-10.md:579: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:580: trailing whitespace.
+Status: partial; no remote database/configuration mutation or deploy executed. Render MCP was configured using the requested URL/client id, but OAuth remains incomplete. DATABASE_URL and RENDER_API_KEY are absent in the execution environment, including the authorized unsandboxed check, and in user/machine variables. No .env fallback was used.
docs/verification/staging-recovery-2026-09-10.md:581: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:582: trailing whitespace.
+Evidence: docs/verification/staging-recovery-2026-09-09.md records sanitized commands/results and all blocked steps. Service plan, dashboard build/pre-deploy commands, auto-deploy, attached disk and failed-deploy logs could not be fetched. The user-reported P3018 contradicts the earlier db-push assumption; the exact dashboard command remains unverified.
docs/verification/staging-recovery-2026-09-10.md:583: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:584: trailing whitespace.
+Public diagnostics only (not post-deploy verification): /login 200, no password input in server-rendered HTML; /uploads/anything.pdf 404; /api/tasks 307 instead of required 401 JSON. The login HTML observation alone does not establish client-rendered UI behavior. The wrong-secret POST was not attempted without a verified active user id. Step 4 has not passed, so the recovery documentation is committed locally only; no push.
docs/verification/staging-recovery-2026-09-10.md:585: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:586: trailing whitespace.
+No new secrets were generated or installed. The planned local path docs/backups/.dev-login-secret.local has been added to .gitignore but no file created. Required next conditions are authenticated Render MCP access and the two credential variables available to the execution shell. Once available, follow the ordered Part C recovery table; stop database work on any original-schema differences. No claim of staging recovery or release sign-off is made.
docs/verification/staging-recovery-2026-09-10.md:587: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:588: trailing whitespace.
+STAGING: partial â€” Render OAuth incomplete and required shell credentials unavailable; verification did not pass.

Exit: 2
```

## 2026-09-09T21:39:18.193Z
```powershell
Get-Content docs/verification/staging-recovery-2026-09-10.md -Tail 45
```
```text
docs/verification/staging-recovery-2026-09-10.md:568: trailing whitespace.
+- [ ] An actual /uploads/<file> URL returns 404 with and without a session.
docs/verification/staging-recovery-2026-09-10.md:569: trailing whitespace.
+- [ ] Downloads require login and authorization; compare file checksum with the backup.
docs/verification/staging-recovery-2026-09-10.md:570: trailing whitespace.
+- [ ] An editable matrix change survives redeploy/reference seeding.
docs/verification/staging-recovery-2026-09-10.md:571: trailing whitespace.
+- [ ] Employee cannot list/download unassigned-case files.
docs/verification/staging-recovery-2026-09-10.md:572: trailing whitespace.
+- [ ] Employee can read but cannot delete assigned-case files.
docs/verification/staging-recovery-2026-09-10.md:573: trailing whitespace.
+- [ ] Arabic/English login layout and password field render correctly.
docs/verification/staging-recovery-2026-09-10.md:574: trailing whitespace.
+- [ ] Separate implementation review passes.
docs/verification/staging-recovery-2026-09-10.md:575: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:576: trailing whitespace.
+STATUS: ready for implementation review
docs/verification/staging-recovery-2026-09-10.md:577: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:578: trailing whitespace.
+## Staging recovery Ã¢â‚¬â€ 2026-09-09/10
docs/verification/staging-recovery-2026-09-10.md:579: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:580: trailing whitespace.
+Status: partial; no remote database/configuration mutation or deploy executed. Render MCP was configured using the requested URL/client id, but OAuth remains incomplete. DATABASE_URL and RENDER_API_KEY are absent in the execution environment, including the authorized unsandboxed check, and in user/machine variables. No .env fallback was used.
docs/verification/staging-recovery-2026-09-10.md:581: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:582: trailing whitespace.
+Evidence: docs/verification/staging-recovery-2026-09-09.md records sanitized commands/results and all blocked steps. Service plan, dashboard build/pre-deploy commands, auto-deploy, attached disk and failed-deploy logs could not be fetched. The user-reported P3018 contradicts the earlier db-push assumption; the exact dashboard command remains unverified.
docs/verification/staging-recovery-2026-09-10.md:583: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:584: trailing whitespace.
+Public diagnostics only (not post-deploy verification): /login 200, no password input in server-rendered HTML; /uploads/anything.pdf 404; /api/tasks 307 instead of required 401 JSON. The login HTML observation alone does not establish client-rendered UI behavior. The wrong-secret POST was not attempted without a verified active user id. Step 4 has not passed, so the recovery documentation is committed locally only; no push.
docs/verification/staging-recovery-2026-09-10.md:585: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:586: trailing whitespace.
+No new secrets were generated or installed. The planned local path docs/backups/.dev-login-secret.local has been added to .gitignore but no file created. Required next conditions are authenticated Render MCP access and the two credential variables available to the execution shell. Once available, follow the ordered Part C recovery table; stop database work on any original-schema differences. No claim of staging recovery or release sign-off is made.
docs/verification/staging-recovery-2026-09-10.md:587: trailing whitespace.
+
docs/verification/staging-recovery-2026-09-10.md:588: trailing whitespace.
+STAGING: partial Ã¢â‚¬â€ Render OAuth incomplete and required shell credentials unavailable; verification did not pass.

Exit: 2
```

Exit: 0
```

Finalization preparation: normalize captured Windows line endings and trailing whitespace before staging. Prior staging succeeded; first cached diff check failed on mixed CRLF output, now corrected. apply_patch created/updated commit helper and normalized runner capture.

Command: git -c core.autocrlf=false add -- BUGFIX.md LAST_SESSION.md docs/MIGRATION_BASELINE.md docs/verification/recovery-runner.cjs docs/verification/check-recovery-env.cjs docs/verification/render-inspect.cjs docs/verification/close-recovery.cjs docs/verification/verify-recovery.cjs docs/verification/commit-recovery.cjs docs/verification/render-failed-deploy-2026-09-10.json docs/verification/staging-recovery-2026-09-10.md
```text

Exit: 0
```

Command: git diff --cached --check
```text
BUGFIX.md:316: trailing whitespace.
+- Missing-context scoped grants deny. PARTIAL is an existing scope whose previous granted semantics are retained; full scope migration remains v0.8.0.
BUGFIX.md:326: trailing whitespace.
+Public diagnostics found /login 200, /uploads/anything.pdf 404 and /api/tasks 307 instead of required 401 JSON. No password input appears in server HTML; client rendering was not verified. Wrong-secret login and actual recovery deploy tests are blocked. The recovery commit remains local as explicitly required when Step 4 does not pass.
LAST_SESSION.md:91: trailing whitespace.
+STAGING: partial — Render OAuth incomplete and required shell credentials unavailable; verification did not pass.
docs/MIGRATION_BASELINE.md:44: trailing whitespace.
+
docs/MIGRATION_BASELINE.md:69: trailing whitespace.
+The planned local dev-login-secret file is docs/backups/.dev-login-secret.local and is ignored by Git. It has not been created; no new secret was generated or uploaded.
docs/verification/recovery-runner.cjs:12: trailing whitespace.
+console.log(out); console.log('Exit:',r.status); process.exitCode=r.status||0;

Exit: 2
```

## 2026-09-09T21:39:47.752Z
```powershell
Get-Content docs/verification/staging-recovery-2026-09-10.md -Tail 18
```
```text

Command: git diff --cached --check
```text
BUGFIX.md:316: trailing whitespace.
+- Missing-context scoped grants deny. PARTIAL is an existing scope whose previous granted semantics are retained; full scope migration remains v0.8.0.
BUGFIX.md:326: trailing whitespace.
+Public diagnostics found /login 200, /uploads/anything.pdf 404 and /api/tasks 307 instead of required 401 JSON. No password input appears in server HTML; client rendering was not verified. Wrong-secret login and actual recovery deploy tests are blocked. The recovery commit remains local as explicitly required when Step 4 does not pass.
LAST_SESSION.md:91: trailing whitespace.
+STAGING: partial â€” Render OAuth incomplete and required shell credentials unavailable; verification did not pass.
docs/MIGRATION_BASELINE.md:44: trailing whitespace.
+
docs/MIGRATION_BASELINE.md:69: trailing whitespace.
+The planned local dev-login-secret file is docs/backups/.dev-login-secret.local and is ignored by Git. It has not been created; no new secret was generated or uploaded.
docs/verification/recovery-runner.cjs:12: trailing whitespace.
+console.log(out); console.log('Exit:',r.status); process.exitCode=r.status||0;

Exit: 2
```

Exit: 0
```

Finalization preparation: normalize captured Windows line endings and trailing whitespace before staging. Prior staging succeeded; first cached diff check failed on mixed CRLF output, now corrected. apply_patch created/updated commit helper and normalized runner capture.

Command: git -c core.autocrlf=false add -- BUGFIX.md LAST_SESSION.md docs/MIGRATION_BASELINE.md docs/verification/recovery-runner.cjs docs/verification/check-recovery-env.cjs docs/verification/render-inspect.cjs docs/verification/close-recovery.cjs docs/verification/verify-recovery.cjs docs/verification/commit-recovery.cjs docs/verification/render-failed-deploy-2026-09-10.json docs/verification/staging-recovery-2026-09-10.md
```text

Exit: 0
```

Command: git diff --cached --check
```text

Exit: 0
```

Command: git diff --cached --stat
```text
 BUGFIX.md                                          |   11 +
 LAST_SESSION.md                                    |    9 +
 docs/MIGRATION_BASELINE.md                         |   28 +-
 docs/verification/check-recovery-env.cjs           |    7 +
 docs/verification/close-recovery.cjs               |   51 +
 docs/verification/commit-recovery.cjs              |   21 +
 docs/verification/recovery-runner.cjs              |   12 +
 .../render-failed-deploy-2026-09-10.json           |    8 +
 docs/verification/render-inspect.cjs               |   14 +
 docs/verification/staging-recovery-2026-09-10.md   | 1529 ++++++++++++++++++++
 docs/verification/verify-recovery.cjs              |    6 +
 11 files changed, 1694 insertions(+), 2 deletions(-)

Exit: 0
```

Finalization commands: `git -c core.autocrlf=false add -- docs/verification/staging-recovery-2026-09-10.md`; `git commit --quiet -m "chore: v0.7.0 staging recovery and Render reconfiguration"`. These run silently; any failure/output is appended below. Success is emitted by commit-recovery.cjs after completion. No push is performed. The commit identifier is omitted from its own contents to avoid a self-reference.
