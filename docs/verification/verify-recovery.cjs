const fs=require('fs');
const files=['BUGFIX.md','LAST_SESSION.md','docs/MIGRATION_BASELINE.md',...fs.readdirSync('docs/verification').filter(n=>/recovery.*\.cjs$|render-inspect\.cjs$|render-failed-deploy-2026-09-10\.json$|staging-recovery-2026-09-10\.md$/.test(n)).map(n=>'docs/verification/'+n)];
let failures=0;
for(const f of files){const s=fs.readFileSync(f,'utf8'); for(const key of ['DATABASE_URL','RENDER_API_KEY']) { const v=process.env[key]; if(v && s.includes(v)){console.log('Credential match detected in '+f+' ('+key+'; value omitted)');failures++;} } if(/postgres(?:ql)?:\/\/[^\s"'<>]+:[^\s"'<>]+@/i.test(s)){console.log('Possible credential URL detected in '+f); failures++;}}
console.log('Secret scan: '+(failures?'FAILED':'PASS')+'; '+files.length+' recovery/documentation files checked; no secret values displayed.');
process.exitCode=failures?1:0;
