# Quality Gates — A&N LPMS

> Every phase or feature must pass all applicable gates before merging or deploying.

---

## Pre-Commit Quality Gates

### Gate 1: Schema Check ✅
- [ ] All new models have a primary key
- [ ] All foreign keys are explicit (not implicit string IDs)
- [ ] No nullable fields that should be required

### Gate 2: Auth Check ✅
- [ ] Every new API route calls `getCurrentUser()` and returns 401 if unauthenticated
- [ ] Every mutation route checks `hasPermission` / `checkApiPermission`

### Gate 3: Permission Check ✅
- [ ] UI hides actions the user cannot perform (`hasPermission` on client)
- [ ] API returns 403 for unauthorized actions (`checkApiPermission` on server)
- [ ] Both client and server are enforced — not just one

### Gate 4: Audit Log Check ✅
- [ ] Every mutating action (create / update / delete) that touches a business record creates an `AuditLog` row
- [ ] AuditLog includes: `userId`, `action`, `entity`, `entityId`, `detail`

### Gate 5: i18n Check ✅
- [ ] All user-visible strings are in `src/i18n/ar.ts` and `src/i18n/en.ts`
- [ ] No hardcoded Arabic or English UI strings in components
- [ ] English text inside Arabic UI is wrapped in `<bdi dir="ltr">`

### Gate 6: RTL / Layout Check ✅
- [ ] No `left` / `right` CSS — use `inset-inline-start` / `inset-inline-end`
- [ ] No `margin-left` / `margin-right` — use `margin-inline-start` / `margin-inline-end`
- [ ] `dir="rtl"` on all Arabic containers

### Gate 7: Type Safety Check ✅
- [ ] No `any` types introduced
- [ ] No `@ts-ignore` added without a documented reason
- [ ] `npm run build` passes with no TypeScript errors

### Gate 8: Prisma Safety Check ✅
- [ ] No raw SQL without parameterization
- [ ] No `deleteMany` / `updateMany` without a `where` clause
- [ ] New migrations are idempotent (safe to re-run)

### Gate 9: API Response Shape Check ✅
- [ ] All API routes return consistent `{ data }` or `{ error }` shapes
- [ ] Errors include a human-readable `message` field
- [ ] No route returns `undefined` or an empty body on success

### Gate 10: Dynamic Route Check ✅
- [ ] Every API route that hits the DB has `export const dynamic = 'force-dynamic'`
- [ ] No DB-reading route is accidentally prerendered

### Gate 11: Data Ownership & Integration Check ✅

For every NEW feature or Phase that creates or consumes data:

**Data source:**
- [ ] Every piece of data has a clear single source of truth (Orgadata file / manual entry / external system)
- [ ] If two systems produce the same data field (e.g. project name from Orgadata AND from ERP) → conflict resolution is defined before coding starts

**Data binding:**
- [ ] Every record is bound to its parent entity via a foreign key (project_id / lead_id / request_id)
- [ ] It is impossible to create an unbound record unless explicitly designed that way
- [ ] If unbound records are allowed → there is a notification or warning visible to Admin

**Cross-system data flow:**
- [ ] If this feature consumes data from a previous Phase or system → the DB foreign key linking them is documented in CODE_STRUCTURE.md before coding starts
- [ ] If the foreign key is missing from an existing table → an idempotent ALTER TABLE migration is added

**Conflict handling:**
- [ ] If data comes from an external file (e.g. Orgadata .docx) AND from user input → conflict is detected server-side and surfaced to the user — never silently overwritten
- [ ] User confirmation is required before any system name/value is updated based on file content

**FAIL if:** Any record can be created without a parent entity when one is required, OR if two data sources can conflict without the user being notified.

---

## Commit Message Convention

Format: `v0.X.0 — [what changed in plain English]`

| Format | When |
|--------|------|
| `v0.X.0` | New module or feature |
| `v0.X.1` | Bug fix or small tweak |
| `v1.0.0` | Go-live on Azure |

Examples:
- `v0.3.0 — HR reports module rebuilt`
- `v0.3.1 — fix work log filter bug`
- `v0.4.0 — cases module complete`
