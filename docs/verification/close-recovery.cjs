const fs=require('fs');
const evidence='docs/verification/staging-recovery-2026-09-10.md';
fs.appendFileSync('docs/MIGRATION_BASELINE.md', `

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

Resume only with valid credentials in the process environment. Execute in order: resolve --rolled-back 0_init; diff from the process URL to prisma/.baseline/schema.original.prisma with --exit-code (require 0); resolve --applied 0_init; migrate deploy; migrate status; diff to prisma/schema.prisma with --exit-code (require 0); npm.cmd run db:seed:reference. Use node .\\node_modules\\prisma\\build\\index.js for every Prisma command. Any original-schema difference stops database steps and permits reporting only. Never source credentials from .env.

Then set the requested four environment variables with merge semantics, set Build Command to npm run build and Pre-Deploy Command to npm run release using REST, preserve plan/disk/auto-deploy, deploy and verify all four requested HTTP assertions before pushing. No dev secret was created in this attempt; the reserved ignored path is docs/backups/.dev-login-secret.local. Historical status sections above describe prior attempts.
`);
fs.appendFileSync('LAST_SESSION.md', `

## Staging recovery 2026-09-10

Partial recovery; documentation committed locally only, no push. Render MCP now works. Explicit workspace tea-d75k71nfte5s73fdo810 was matched to both supplied resource IDs. Service Starter, auto-deploy yes/commit/main; database available. Actual Build Command: npm install && npx prisma generate && npx prisma migrate deploy && npm run build. Pre-Deploy Command and disk attachment are not exposed in the service response and remain unconfirmed.

Saved the full dep-dagsbh49v7es73ejbn2g failure log confirming P3018 / MatterStatus already exists. DATABASE_URL and RENDER_API_KEY exist in the process but contain placeholders; the database host does not match the supplied Render database. Step 2a failed P1001 before connection; no database mutation occurred. REST inspection also failed with the invalid key. No credentials were taken from .env, and no secret values were recorded.

Steps 2b-g, configuration and deploy were not run because prerequisites failed. No new secret exists at the planned gitignored docs/backups/.dev-login-secret.local path. Existing remote env vars, plan, disk and auto-deploy remain untouched. Step 4 did not pass. Evidence and every captured command/output: docs/verification/staging-recovery-2026-09-10.md. Resume Part C with valid process credentials; do not mark either migration applied without the required schema comparison. The unrelated .env.example edit is excluded from this commit.
`);
fs.appendFileSync('BUGFIX.md', `

### Render dashboard command assumption was wrong: actual command was npm install && npx prisma generate && npx prisma migrate deploy && npm run build
- **Found by:** Codex via authenticated Render MCP and failed-deployment logs
- **Date:** 2026-09-10
- **Module:** Staging deployment / migration baseline
- **Expected:** Verify actual Render dashboard settings before selecting a reconciliation path.
- **Actual:** The prior schema-push assumption was false; the dashboard ran migrate deploy against a populated database, attempting 0_init and failing P3018 on MatterStatus.
- **Priority:** High
- **Status:** Diagnosis confirmed; recovery blocked by placeholder process credentials. Dashboard command unchanged.
- **Evidence:** docs/verification/staging-recovery-2026-09-10.md and render-failed-deploy-2026-09-10.json. Target build npm run build; target pre-deploy npm run release after successful ordered reconciliation.
`);
fs.appendFileSync(evidence,'\nDocumentation edits: apply_patch updated runbook current status and verified command; node docs/verification/close-recovery.cjs appended the latest Part C done/not-done table, LAST_SESSION section and BUGFIX entry. Output: success. No application code changed.\n');
console.log('Updated MIGRATION_BASELINE.md, LAST_SESSION.md and BUGFIX.md with partial recovery evidence.');
