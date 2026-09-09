# Authorization inventory — v0.7.0

All routes are additionally behind configured staging Basic auth; protected APIs have signed-token middleware. Table records handler checks. Legacy keys remain deliberately unmigrated. Inspect helper implementations when replacing scopes; do not mechanically map assignment to visibility.

| File | Method | Current check | Target |
|---|---|---|---|
| src/app/api/audit-log/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/auth/login/route.ts | POST | picker flag + shared secret + active-user validation | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/auth/login/route.ts | DELETE | cookie clearing; Basic middleware | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/auth/me/route.ts | GET | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/auth/users/route.ts | GET | picker flag; Basic middleware | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/cases/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/cases/route.ts | POST | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/cases/[id]/route.ts | GET | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/cases/[id]/route.ts | PUT | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/clients/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/clients/route.ts | POST | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/clients/[id]/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/clients/[id]/route.ts | PUT | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/conflict-check/route.ts | POST | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/dashboard/summary/route.ts | GET | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/departments/route.ts | GET | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/departments/route.ts | POST | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/departments/[id]/route.ts | PATCH | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/departments/[id]/route.ts | DELETE | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/files/route.ts | GET | role string; file policy (legacy matrix/ownership); auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/files/route.ts | POST | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/files/[id]/download/route.ts | GET | file policy (legacy matrix/ownership); auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/files/[id]/route.ts | GET | file policy (legacy matrix/ownership); auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/files/[id]/route.ts | DELETE | file policy (legacy matrix/ownership); auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/matters/route.ts | GET | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/matters/route.ts | POST | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/matters/[id]/route.ts | GET | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/matters/[id]/route.ts | PATCH | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/matters/[id]/route.ts | DELETE | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/notifications/route.ts | GET | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/notifications/route.ts | PATCH | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/permissions/matrix/route.ts | GET | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/permissions/matrix/route.ts | PATCH | DB permission; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/config/route.ts | GET | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/config/route.ts | PATCH | DB permission; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/performance/drilldown/route.ts | GET | report scope helper (DB snapshot) | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/performance/export/route.ts | POST | report scope helper (DB snapshot) | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/performance/route.ts | GET | report scope helper (DB snapshot) | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/utilization/drilldown/route.ts | GET | report scope helper (DB snapshot) | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/utilization/export/route.ts | POST | report scope helper (DB snapshot) | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/reports/utilization/route.ts | GET | report scope helper (DB snapshot) | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/tasks/route.ts | GET | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/tasks/route.ts | POST | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/tasks/[id]/route.ts | GET | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/tasks/[id]/route.ts | PATCH | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/uploads-denied/route.ts | all | unconditional 404 | retain denial |
| src/app/api/users/assignable/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/users/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/users/route.ts | PUT | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/work-logs/route.ts | GET | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/work-logs/route.ts | POST | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/work-logs/[id]/route.ts | PATCH | legacy matrix; role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/work-logs/[id]/route.ts | DELETE | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/work-types/route.ts | GET | auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/work-types/route.ts | POST | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |
| src/app/api/work-types/route.ts | PUT | role string; auth | v0.8.0: explicit DB action + resource scope; retain auth/denial |

| src/app/api/health/route.ts | GET | none in handler; Basic/token middleware | define health-probe policy explicitly in v0.8.0 |
