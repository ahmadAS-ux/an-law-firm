# Untracked inventory — 2026-09-09

Original tracked modifications: none. Branch: main.
Stash: stash@{0}: pre-v0.5.0 uncommitted changes (untouched).

| Path | Bytes | Modified | Screening |
|---|---:|---|---|
| docs/backups/PART_A_2026-09.md | 481 | 2026-09-09T23:07:36 | screened |
| docs/prompt-review-v0.7.0.md | 1343 | 2026-09-09T23:12:56 | screened |
| prisma/.baseline/schema.original.prisma | 16498 | 2026-05-13T01:39:58 | needs manual review (pattern hit) |
| prompts/v0.7.0-safe-baseline.md | 31136 | 2026-09-09T23:12:56 | needs manual review (pattern hit) |
| src/app/api/reports/config/route.ts | 2720 | 2026-05-13T01:52:54 | screened |
| src/app/api/reports/performance/drilldown/route.ts | 3238 | 2026-05-13T01:52:01 | screened |
| src/app/api/reports/performance/export/route.ts | 2540 | 2026-05-13T01:52:33 | screened |
| src/app/api/reports/performance/route.ts | 890 | 2026-05-13T01:51:34 | screened |
| src/app/api/reports/utilization/drilldown/route.ts | 1711 | 2026-05-13T01:51:46 | screened |
| src/app/api/reports/utilization/export/route.ts | 2855 | 2026-05-13T01:52:19 | screened |
| src/app/api/reports/utilization/route.ts | 890 | 2026-05-13T01:51:27 | screened |
| src/lib/reports/route-guard.ts | 3179 | 2026-05-13T01:51:20 | screened |

## Verification and screening resolution

All original report/guard files were preserved in 29bf2e2. Project TypeScript with all original files present passed; original Vitest 20/20 and lint passed. Project compilation without individual auto-discovered route files was not used as a release claim; imports can pull excluded files back in. Runtime routes are discovered by Next rather than explicit imports. route-guard is imported by the preserved report routes.

Schema/prompt pattern hits were inspected: DATABASE_URL/NEXTAUTH_SECRET are variable identifiers and illustrative placeholders, not credential values. These explicitly requested artifacts are included. No .env files or backup contents are staged. The stash remains untouched. .claude tracked workflow files are retained; untracked tool state is not staged.

## Isolated with/without source diagnostics

Executed against v0.7.0 source copies after implementation; original files were never removed. All-present baseline compared with each preserved file omitted from its own isolated source tree. These do not replace the pre-change baseline results above.

| Omitted path | Project tsc result |
|---|---|
| all present | PASS |
| src/app/api/reports/config/route.ts | PASS |
| src/app/api/reports/performance/drilldown/route.ts | PASS |
| src/app/api/reports/performance/export/route.ts | PASS |
| src/app/api/reports/performance/route.ts | PASS |
| src/app/api/reports/utilization/drilldown/route.ts | PASS |
| src/app/api/reports/utilization/export/route.ts | PASS |
| src/app/api/reports/utilization/route.ts | PASS |
| src/lib/reports/route-guard.ts | diagnostics (expected when imported file omitted) |

Final omission diagnostics: docs/verification/inventory-guard-omitted.log. Earlier attempts had unavailable dependency/generated-type prerequisites and are superseded, not treated as source failures.


Final screening: the only literal connection strings in new verification artifacts target disposable loopback PostgreSQL; .env.example contains a documented placeholder. npm install logs include the dependency publisher's public support email from npm's own warning. Synthetic test identities use example.invalid. No live secrets, private keys, backup data or client contact records were found. Required command logs are retained as factual evidence.
