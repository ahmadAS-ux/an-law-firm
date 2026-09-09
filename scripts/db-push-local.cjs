const { spawnSync } = require('node:child_process');
let hostname;
try { hostname = new URL(process.env.DATABASE_URL || '').hostname; } catch { throw new Error('Provide an explicit local DATABASE_URL'); }
if (!(hostname === 'localhost' || hostname === '127.0.0.1')) throw new Error('db:push:local refuses non-loopback targets');
const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push'], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
