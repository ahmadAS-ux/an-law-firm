const fs = require('fs');
const crypto = require('node:crypto');
const cp = require('child_process');
const log = 'docs/verification/staging-recovery-2026-09-10.md';
const serviceId = 'srv-d79p63fkijhs7391qj30';
const workspaceId = 'tea-d75k71nfte5s73fdo810';
let session; let seq=0;
function record(command, output) { fs.appendFileSync(log, '\nCommand: '+command+'\n```text\n'+output+'\n```\n'); console.log(output); }
async function rpc(method, params) {
 const headers={Authorization:'Bearer '+process.env.RENDER_API_KEY,'Content-Type':'application/json',Accept:'application/json, text/event-stream'};
 if(session) headers['Mcp-Session-Id']=session;
 const response=await fetch('https://mcp.render.com/mcp',{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params})});
 session=response.headers.get('mcp-session-id')||session;
 if(!response.ok) throw new Error('MCP HTTP '+response.status);
 const raw=await response.text();
 let result; try{result=JSON.parse(raw)}catch{const lines=raw.split('\n').filter(x=>x.startsWith('data: ')); result=JSON.parse(lines[lines.length-1].slice(6));}
 if(result.error) throw new Error('MCP RPC error '+result.error.code);
 return result.result;
}
async function main(){
 if(!process.env.RENDER_API_KEY) throw new Error('Process API key missing');
 await rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'staging-recovery',version:'1.0'}});
 record('MCP initialize (Bearer credential from process; omitted)','Initialized');
 const listing=await rpc('tools/list',{});
 const update=listing.tools.find(t=>t.name==='update_environment_variables');
 if(!update) throw new Error('Required MCP environment tool unavailable');
 record('MCP tools/list (selected tool schema)',JSON.stringify(update));
 if(process.argv.includes('--inspect-only')) return;
 const secretPath='docs/backups/.dev-login-secret.local';
 const ignored=cp.spawnSync('git',['check-ignore','--quiet','--',secretPath]);
 record('git check-ignore --quiet -- '+secretPath,'Exit: '+ignored.status);
 if(ignored.status!==0) throw new Error('Secret path is not ignored');
 if(fs.existsSync(secretPath)) throw new Error('Secret path already exists; refusing overwrite');
 const authSecret=crypto.randomBytes(48).toString('base64');
 const devSecret=crypto.randomBytes(12).toString('base64url');
 fs.writeFileSync(secretPath,devSecret,{flag:'wx',mode:0o600});
 record('node:crypto randomBytes(48).toString(base64); randomBytes(12).toString(base64url); exclusive write to ignored secret path','Generated secrets in memory; 16-character dev secret saved only to '+secretPath+'; values omitted');
 const result=await rpc('tools/call',{name:update.name,arguments:{serviceId,workspaceId,replace:false,envVars:[{key:'NEXTAUTH_SECRET',value:authSecret},{key:'DEV_LOGIN_PICKER_ENABLED',value:'true'},{key:'DEV_LOGIN_SECRET',value:devSecret},{key:'NEXT_TELEMETRY_DISABLED',value:'1'}]}});
 record('MCP update_environment_variables (four requested keys; replace=false; secret values omitted)','isError: '+Boolean(result.isError)+'; response body withheld to prevent secret disclosure');
 if(result.isError) throw new Error('MCP environment update failed');
 const body={serviceDetails:{envSpecificDetails:{buildCommand:'npm run build'},preDeployCommand:'npm run release'}};
 const response=await fetch('https://api.render.com/v1/services/'+serviceId,{method:'PATCH',headers:{Authorization:'Bearer '+process.env.RENDER_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
 record('REST PATCH /v1/services/'+serviceId+' '+JSON.stringify(body),'HTTP '+response.status);
 if(!response.ok) throw new Error('Render PATCH failed');
}
module.exports={rpc,record};
if(require.main===module) main().catch(e=>{record('Configuration result',e.message.startsWith('MCP')||e.message.startsWith('Render')||e.message.startsWith('Secret')||e.message.startsWith('Process')||e.message.startsWith('Required')?e.message:'Safe failure class: '+e.name);process.exitCode=1;});
