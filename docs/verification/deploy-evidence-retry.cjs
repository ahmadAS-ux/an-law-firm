const fs=require('fs');
const {rpc,record}=require('./configure-render-retry.cjs');
const serviceId='srv-d79p63fkijhs7391qj30',workspaceId='tea-d75k71nfte5s73fdo810';
async function main(){
 await rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'staging-recovery',version:'1.0'}});
 const deployId=process.argv[2]||'dep-dagtbimq1p3s738rt890';
 const result=await rpc('tools/call',{name:'get_deploy',arguments:{serviceId,workspaceId,deployId}});
 record('MCP get_deploy '+deployId,JSON.stringify(result));
 if(!process.argv.includes('--logs'))return;
 const credentials=await fetch('https://api.render.com/v1/services/'+serviceId+'/env-vars',{headers:{Authorization:'Bearer '+process.env.RENDER_API_KEY}});
 if(!credentials.ok)throw new Error('Cannot initialize log redaction');
 const env=await credentials.json();
 const secrets=env.map(x=>(x.envVar||x)).filter(x=>/SECRET|TOKEN|PASSWORD|KEY|DATABASE_URL|AUTH/i.test(x.key)).map(x=>x.value).filter(Boolean);
 secrets.push(process.env.DATABASE_URL,process.env.RENDER_API_KEY);
 const clean=s=>{for(const value of secrets.filter(Boolean))s=s.split(value).join('[REDACTED]');return s.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi,'[REDACTED_DATABASE_URL]').replace(/rnd_[A-Za-z0-9_-]+/g,'[REDACTED_API_KEY]');};
 let startTime=process.argv.includes('--intermediate')?'2026-09-09T21:52:42Z':'2026-09-09T21:55:22Z';
 let endTime=process.argv.includes('--intermediate')?'2026-09-09T21:55:22Z':undefined;
 const pages=[];
 for(let i=0;i<30;i++){
  const args={resource:[serviceId],workspaceId,startTime,...(endTime?{endTime}:{}),direction:'forward',limit:100};
  const response=await rpc('tools/call',{name:'list_logs',arguments:args});
  const safe=clean(JSON.stringify(response));pages.push(JSON.parse(safe));record('MCP list_logs '+JSON.stringify(args),safe);
  const body=JSON.parse(response.content.find(c=>c.type==='text').text);if(!body.hasMore)break;startTime=body.nextStartTime;endTime=body.nextEndTime;
 }
 const filename='docs/verification/render-'+deployId+'-2026-09-10.json';fs.writeFileSync(filename,JSON.stringify(pages,null,2)+'\n');record('Save sanitized deployment log',filename);
}
main().catch(e=>{record('Deployment evidence failure','Safe error class: '+e.name);process.exitCode=1;});
