# Dependency review — 2026-09-09

Installed Next.js: 14.2.15 (unchanged by instruction). The official December 2025 advisory lists 14.2.35 for its 14.x fix; do not treat that historical patch as a complete current audit clearance. v0.8.0 must select a verified patched target.

Source: https://nextjs.org/blog/security-update-2025-12-11

Full machine evidence: verification/npm-audit.json. npm audit --omit=dev returned vulnerabilities (not a passing security gate).

{
  "info": 0,
  "low": 11,
  "moderate": 16,
  "high": 19,
  "critical": 1,
  "total": 47
}

| Package | Severity | Direct | Fix reported |
|---|---|---|---|
| @babel/core | high | false | false |
| @babel/helper-compilation-targets | high | false | true |
| @babel/helper-create-class-features-plugin | low | false | true |
| @babel/helper-module-transforms | low | false | false |
| @babel/helper-replace-supers | low | false | true |
| @babel/plugin-syntax-jsx | low | false | true |
| @babel/plugin-syntax-typescript | low | false | true |
| @babel/plugin-transform-modules-commonjs | low | false | true |
| @babel/plugin-transform-typescript | low | false | true |
| @babel/preset-typescript | low | false | true |
| @hono/node-server | moderate | false | true |
| @modelcontextprotocol/sdk | high | false | true |
| @prisma/client | high | true | false |
| @prisma/config | high | false | false |
| @ts-morph/common | moderate | false | true |
| ajv | high | false | true |
| ajv-formats | high | false | true |
| baseline-browser-mapping | moderate | false | true |
| body-parser | moderate | false | true |
| brace-expansion | high | false | true |
| browserslist | high | false | true |
| cosmiconfig | moderate | false | true |
| deepmerge-ts | high | false | false |
| esbuild | low | false | false |
| express | moderate | false | true |
| express-rate-limit | moderate | false | true |
| fast-uri | high | false | true |
| hono | high | false | true |
| ip-address | high | false | true |
| js-yaml | high | false | true |
| minimatch | moderate | false | true |
| nanoid | high | false | false |
| next | critical | true | false |
| postcss | high | true | false |
| postcss-import | moderate | false | true |
| postcss-js | moderate | false | true |
| postcss-load-config | moderate | false | true |
| postcss-nested | moderate | false | true |
| postcss-selector-parser | low | false | true |
| prisma | high | true | false |
| qs | moderate | false | true |
| shadcn | high | true | false |
| tailwindcss | moderate | true | false |
| tailwindcss-animate | moderate | true | false |
| ts-morph | moderate | false | true |
| tsx | low | true | false |
| update-browserslist-db | high | false | true |
