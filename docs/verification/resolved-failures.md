# Failures encountered and resolved

- Initial git add/commit: `fatal: Unable to create .../.git/index.lock: Permission denied`. Retried using authorized Git sandbox escalation; preservation commit succeeded.
- npm server-only installation: `npm error code EPERM`, `npm error syscall open`, `npm error ...npm-cache...`. Retried with workspace-local npm cache; dependency installed.
- Local PostgreSQL startup: `pg_ctl: could not create restricted token: error code 87`, `pg_ctl: could not start server: error code 3`. Authorized loopback-only startup through escalation succeeded.
- Typecheck during implementation: `src/app/api/files/[id]/route.ts(40,51): error TS18047: 'f.url' is possibly 'null'.` Resolved by completing private storage/soft-delete handler.
- Typecheck during implementation: `src/lib/session-token.ts(9,38): error TS2802: Type 'Uint8Array<ArrayBufferLike>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.` Resolved with Array.from encoding.
- First modified suite: `Tests 4 failed | 39 passed (43)`. Existing permission mocks retained unused mockResolvedValueOnce entries after the new missing-key early return. Replaced clearAllMocks with resetAllMocks, preserving all original assertions. Failures were `expected false to be true` (ALL, matching OWN_DEPARTMENT, matching OWN) and `expected true to be false` (granted=false).
- First lint: `'_key' is defined but never used`, `'_url' is defined but never used`, and corresponding assigned-but-never-used errors in file DTO projection. Explicitly discarded private storage fields; lint passed.
- Build warning: `[webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: Unable to snapshot resolve dependencies`. Build nonetheless compiled and completed successfully; no suppression added.

Final command outputs are preserved alongside this file. No remote credentials or backup contents are recorded here.

- Plain Windows npm ci postinstall failure: full verbatim output in npm-ci.log. Resolved using process-local npm_config_script_shell; successful complete log in npm-ci-powershell.log.
- Clean-install TypeScript failure before explicit Prisma generation: complete diagnostics in typecheck-before-generate.log; resolved generation followed by clean typecheck.log.
- Isolated omission diagnostic (intentional): full six TS2307 missing route-guard imports in inventory-guard-omitted.log. Initial isolated attempts overlapped dependency installation / preceded generated Prisma types; final all-present project passes.

Git whitespace review: raw verification logs retain terminal trailing spaces/blank lines verbatim. Source/document diffs have no whitespace errors; the schema baseline is kept as captured.
