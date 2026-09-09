const fs = require('fs');
const log = 'docs/verification/staging-recovery-2026-09-10.md';
async function main() {
 if (!process.env.RENDER_API_KEY) throw new Error('RENDER_API_KEY missing');
 for (const endpoint of ['/services/srv-d79p63fkijhs7391qj30', '/disks?serviceId=srv-d79p63fkijhs7391qj30']) {
  const r = await fetch('https://api.render.com/v1'+endpoint,{headers:{Authorization:'Bearer '+process.env.RENDER_API_KEY}});
  if (!r.ok) { console.log('Render HTTP status: '+r.status); continue; }
  const body = await r.json();
  const safe = endpoint.startsWith('/services') ? {status:r.status,plan:body.serviceDetails?.plan,buildCommand:body.serviceDetails?.envSpecificDetails?.buildCommand,preDeployCommand:body.serviceDetails?.preDeployCommand ?? body.serviceDetails?.envSpecificDetails?.preDeployCommand ?? null,autoDeploy:body.autoDeploy,disk:body.serviceDetails?.disk ?? null} : {status:r.status,disks:Array.isArray(body)?body.map(x=>({id:(x.disk??x).id,serviceId:(x.disk??x).serviceId,mountPath:(x.disk??x).mountPath})): 'Request failed'};
  const text = JSON.stringify(safe,null,2);
  fs.appendFileSync(log,'\nREST GET /v1'+endpoint+' (Authorization from process environment; omitted)\n```json\n'+text+'\n```\n'); console.log(text);
 }
}
main().catch(e=>{console.error('Render inspection failed; safe error classification: '+e.name+'; code: '+(e.cause?.code??e.code??'unavailable'));process.exitCode=1});
