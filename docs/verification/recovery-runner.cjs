const fs = require('fs');
const cp = require('child_process');
const log = 'docs/verification/staging-recovery-2026-09-10.md';
function clean(s) {
 for (const [k,v] of Object.entries(process.env)) if (v && /SECRET|TOKEN|PASSWORD|DATABASE_URL|API_KEY/i.test(k)) s=s.split(v).join('[REDACTED]');
 return s.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi,'[REDACTED_DATABASE_URL]').replace(/rnd_[A-Za-z0-9_-]+/g,'[REDACTED_API_KEY]').replace(/\r\n/g,'\n');
}
const cmd=process.argv[2];
const r=cp.spawnSync('powershell.exe',['-NoProfile','-Command',cmd],{encoding:'utf8',env:process.env,maxBuffer:20*1024*1024});
const out=clean((r.stdout||'')+(r.stderr||''));
fs.appendFileSync(log,'\n## '+new Date().toISOString()+'\n```powershell\n'+clean(cmd)+'\n```\n```text\n'+out+'\nExit: '+r.status+'\n```\n');
console.log(out); console.log('Exit:',r.status); process.exitCode=r.status||0;
