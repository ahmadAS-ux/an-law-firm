const fs=require('fs');
const cp=require('child_process');
const log='docs/verification/staging-recovery-2026-09-10.md';
const paths=['BUGFIX.md','LAST_SESSION.md','docs/MIGRATION_BASELINE.md',...['recovery-runner.cjs','check-recovery-env.cjs','render-inspect.cjs','close-recovery.cjs','verify-recovery.cjs','commit-recovery.cjs','render-failed-deploy-2026-09-10.json','staging-recovery-2026-09-10.md'].map(n=>'docs/verification/'+n)];
function clean(s){for(const [k,v] of Object.entries(process.env))if(v && /SECRET|TOKEN|PASSWORD|DATABASE_URL|API_KEY/i.test(k))s=s.split(v).join('[REDACTED]');return s;}
function run(args){const r=cp.spawnSync('git',args,{encoding:'utf8'});const out=clean((r.stdout||'')+(r.stderr||''));fs.appendFileSync(log,'\nCommand: git '+args.join(' ')+'\n```text\n'+out+'\nExit: '+r.status+'\n```\n');if(r.status!==0)throw new Error('Git command failed; see sanitized record');return out;}
try {
 fs.appendFileSync(log,'\nFinalization preparation: normalize captured Windows line endings and trailing whitespace before staging. Prior staging succeeded; first cached diff check failed on mixed CRLF output, now corrected. apply_patch created/updated commit helper and normalized runner capture.\n');
 fs.writeFileSync(log,fs.readFileSync(log,'utf8').replace(/\r\n/g,'\n').replace(/[\t ]+$/gm,''));
 for(const file of paths) fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n').replace(/[\t ]+$/gm,''));
 run(['-c','core.autocrlf=false','add','--',...paths]);
 run(['diff','--cached','--check']);
 console.log(run(['diff','--cached','--stat']));
 fs.appendFileSync(log,'\nFinalization commands: `git -c core.autocrlf=false add -- docs/verification/staging-recovery-2026-09-10.md`; `git commit --quiet -m "chore: v0.7.0 staging recovery and Render reconfiguration"`. These run silently; any failure/output is appended below. Success is emitted by commit-recovery.cjs after completion. No push is performed. The commit identifier is omitted from its own contents to avoid a self-reference.\n');
 for(const args of [['-c','core.autocrlf=false','add','--',log],['commit','--quiet','-m','chore: v0.7.0 staging recovery and Render reconfiguration']]) {
  const r=cp.spawnSync('git',args,{encoding:'utf8'});const out=clean((r.stdout||'')+(r.stderr||''));
  if(out || r.status!==0)fs.appendFileSync(log,'\nFinalization output for git '+args.join(' ')+':\n```text\n'+out+'\nExit: '+r.status+'\n```\n');
  if(r.status!==0)throw new Error('Finalization failed; see sanitized record');
 }
 console.log('Local recovery commit succeeded. No push performed.');
} catch(e){console.error(e.message);process.exitCode=1;}
