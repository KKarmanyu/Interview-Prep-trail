import { env } from 'cloudflare:workers';
export async function verifyHuman(token:unknown,ip:string|null,hostname:string):Promise<'ok'|'rejected'|'unavailable'>{
 const config=env as unknown as Record<string,string|undefined>;
 if(!config.TURNSTILE_SECRET_KEY&&!config.TURNSTILE_SITE_KEY)return 'ok';
 if(!config.TURNSTILE_SECRET_KEY||!config.TURNSTILE_SITE_KEY)return 'unavailable';
 if(typeof token!=='string'||!token||token.length>2048)return 'rejected';
 try{
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:config.TURNSTILE_SECRET_KEY,response:token,...(ip?{remoteip:ip}:{})})});
  if(!response.ok)return 'unavailable';
  const body=await response.json() as {success?:boolean;hostname?:string;action?:string};
  return body.success&&body.hostname===hostname&&body.action==='submit-question'?'ok':'rejected';
 }catch{return 'unavailable';}
}
