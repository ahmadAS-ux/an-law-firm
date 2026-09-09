const fs=require('fs');
const log='docs/verification/staging-recovery-2026-09-10.md';
const base='https://an-law-firm.onrender.com';
async function request(path,options={}){return fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(60000),...options});}
function record(command,result){const out=JSON.stringify(result);fs.appendFileSync(log,'\nCommand: '+command+'\n```json\n'+out+'\n```\n');console.log(command+' '+out);}
async function main(){
 const login=await request('/login');const html=await login.text();
 let field=/<input[^>]*(?:id="dev-secret"[^>]*type="password"|type="password"[^>]*id="dev-secret")/i.test(html);
 const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
 for(const src of scripts){if(field)break;const response=await request(src);const js=await response.text();const match=response.status===200&&js.includes('dev-secret')&&/type\s*:\s*["']password["']/.test(js);record('GET '+src,{status:response.status,devSecretPasswordField:match});field ||= match;}
 record('GET /login',{status:login.status,devSecretPasswordField:field});
 const uploads=await request('/uploads/anything.pdf');record('GET /uploads/anything.pdf',{status:uploads.status});
 const usersResponse=await request('/api/auth/users');const users=await usersResponse.json();const user=users.users?.[0];record('GET /api/auth/users (select existing active seeded account; personal data omitted)',{status:usersResponse.status,validUserFound:Boolean(user?.id)});
 if(!user?.id)throw new Error('No valid existing user available');
 const auth=await request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:user.id,devSecret:'deliberately-wrong-recovery-check'})});record('POST /api/auth/login (valid existing user ID; deliberately wrong dev secret)',{status:auth.status});
 const tasks=await request('/api/tasks');const type=tasks.headers.get('content-type');let json=false;try{await tasks.json();json=true}catch{}record('GET /api/tasks (no cookie; no redirects)',{status:tasks.status,contentType:type,json});
 const passed=login.status===200&&field&&uploads.status===404&&auth.status===401&&tasks.status===401&&json&&Boolean(type?.includes('application/json'));
 record('Step 4 HTTP assertions',{passed});if(!passed)process.exitCode=1;
}
main().catch(e=>{record('HTTP verification failure',{class:e.name});process.exitCode=1;});
