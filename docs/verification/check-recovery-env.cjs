for (const key of ['DATABASE_URL','RENDER_API_KEY']) {
 const v = process.env[key];
 const status = {name:key,present:Boolean(v),containsPlaceholder:Boolean(v && (/[…]|\.\.\.|<[^>]+>/.test(v)))};
 if (key==='DATABASE_URL' && v) { try { const u=new URL(v); status.matchesExpectedDatabaseHost=u.hostname.startsWith('dpg-d79ounk50q8c73fn5k8g-a'); } catch { status.validURL=false; } }
 if (key==='RENDER_API_KEY') status.asciiOnly=Boolean(v && /^[\x20-\x7E]+$/.test(v));
 console.log(JSON.stringify(status));
}
