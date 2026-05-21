# Testing — A&N LPMS

## Current Setup

| Tool | Status |
|------|--------|
| Vitest | Configured and running |
| @testing-library/react | Installed |
| @testing-library/jest-dom | Installed |
| jsdom | Configured as test environment |

## Where Tests Live

```
src/lib/__tests__/
  permissions.test.ts       — unit tests for hasPermission(), checkApiPermission()
  api-permissions.test.ts   — unit tests for API-layer permission helpers
```

Tests are collected under `src/lib/__tests__/` — not co-located next to source files. Keep new tests there.

## Running Tests

```bash
npm test           # watch mode (reruns on file change)
npm run test:run   # single run, no watch — use before committing
npm run test:ui    # browser UI for reviewing results
```

Dev server runs on **http://localhost:3000**.

## Configuration

**`vitest.config.ts`** — at repo root (not extending a vite.config, standalone):
- `environment: "jsdom"`
- `globals: true` — `describe`, `it`, `expect` available without imports
- `setupFiles: ["./vitest.setup.ts"]`
- `@` path alias → `./src`

**`vitest.setup.ts`** — imports `@testing-library/jest-dom` to extend Vitest matchers with DOM assertions.

**Important:** `vitest.config.ts` and `vitest.setup.ts` are excluded from the Next.js TypeScript build (`tsconfig.json`). Do not add them back to tsconfig's `include` list — this was a deliberate fix in v0.5.1.

## What to Test

- Business logic in `src/lib/` (permissions, auth helpers, report utilities)
- Pure functions with complex branching or data transformation

**Do not test** route handlers, page components, or pure UI rendering.

## Writing a Test

```typescript
// src/lib/__tests__/example.test.ts
import { describe, it, expect } from 'vitest'
import { someHelper } from '@/lib/someHelper'

describe('someHelper', () => {
  it('returns X for input Y', () => {
    expect(someHelper('Y')).toBe('X')
  })
})
```

## MSW (Mock Service Worker) — not yet set up

MSW intercepts network-layer calls and is useful for integration tests against Prisma/API routes. Not yet configured. If added, set up a Node-mode server in `src/lib/__tests__/mocks/` and wire the lifecycle into `vitest.setup.ts`.

## Playwright (E2E) — not yet set up

End-to-end tests are not yet configured. When added, use `http://localhost:3000` as the base URL and place tests in an `e2e/` folder at the project root (outside `src/`).
