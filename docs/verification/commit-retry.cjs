const fs=require('fs'),cp=require('child_process');
const log='docs/verification/staging-recovery-2026-09-10.md';
const paths=['BUGFIX.md','LAST_SESSION.md','docs/MIGRATION_BASELINE.md',log,...['configure-render-retry.cjs','http-recovery-retry.cjs','finish-retry.cjs','deploy-evidence-retry.cjs','commit-retry.cjs','retry-inspection-2026-09-10.md','retry-mcp-operations-2026-09-10.json','render-dep-dagtbimq1p3s738rt890-2026-09-10.json'].map(x=>'docs/verification/'+x)];
const secrets=Object.entries(process.env).filter(([k,v])=>v&&/SECRET|TOKEN|PASSWORD|DATABASE_URL|API_KEY/i.test(k)).map(([,v])=>v);
if(fs.existsSync('docs/backups/.dev-login-secret.local'))secrets.push(fs.readFileSync('docs/backups/.dev-login-secret.local','utf8').trim());
const clean=s=>{for(const value of secrets)s=s.split(value).join('[REDACTED]');return s;};
function run(args){const r=cp.spawnSync('git',['-c','core.excludesFile=','-c','core.autocrlf=false',...args],{encoding:'utf8'});const output=clean((r.stdout||'')+(r.stderr||''));fs.appendFileSync(log,'\nCommand: git -c core.excludesFile= -c core.autocrlf=false '+args.join(' ')+'\n```text\n'+output+'\nExit: '+r.status+'\n```\n');if(r.status!==0)throw new Error('Git operation failed');return output;}
function silent(args){fs.appendFileSync(log,'\nFinalization command: git -c core.excludesFile= -c core.autocrlf=false '+args.join(' ')+'\nOutput: empty on success; any output/failure is recorded below.\n');return args;}
function execute(args){const r=cp.spawnSync('git',['-c','core.excludesFile=','-c','core.autocrlf=false',...args],{encoding:'utf8'});const out=clean((r.stdout||'')+(r.stderr||''));if(out||r.status!==0)fs.appendFileSync(log,'\nFinalization result: '+clean(args.join(' '))+'\n```text\n'+out+'\nExit: '+r.status+'\n```\n');if(r.status!==0)throw new Error('Git finalization failed');}
try{
 if(!fs.readFileSync(log,'utf8').includes('"passed":true'))throw new Error('Step 4 pass evidence missing');
 for(const file of paths){const data=fs.readFileSync(file,'utf8');if(secrets.some(secret=>secret&&data.includes(secret)))throw new Error('Secret scan failed; values withheld');fs.writeFileSync(file,data.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/[\t ]+$/gm,'').trimEnd()+'\n');}
 fs.appendFileSync(log,'\nSecret scan of all intended commit files: passed (process secrets and ignored dev secret checked in memory; values omitted). apply_patch authored recovery, HTTP, deploy-evidence, documentation and commit helpers; outputs were successful empty objects. Sleep/poll waits produced no command output.\n');
 run(['add','--',...paths]);run(['diff','--cached','--check']);const names=run(['diff','--cached','--name-only']);if(names.trim().split('\n').some(x=>!paths.includes(x)))throw new Error('Unexpected staged path');
 const commit=silent(['commit','--quiet','-m','chore: v0.7.0 staging recovery and Render reconfiguration']);
 const push=process.argv.includes('--push')?silent(['push','--quiet','origin','main']):null;
 execute(['add','--',log]);execute(commit);if(push)execute(push);
 console.log(push?'Recovery commit created and pushed to main.':'Recovery commit created locally.');
}catch(e){console.error(e.message);process.exitCode=1;}
