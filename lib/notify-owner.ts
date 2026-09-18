import { env } from 'cloudflare:workers';
type Submission={id:string;name:string;email:string;role:string;question:string};
export async function notifyOwner(item:Submission,db:D1Database){
 const config=env as unknown as Record<string,string|undefined>;
 if(config.MAIL_SEND_ENABLED!=='true'||!config.RESEND_API_KEY||!config.MAIL_FROM||!config.NOTIFICATION_EMAIL)return;
 let status='unknown';
 try{
  const response=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+config.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'question-'+item.id},body:JSON.stringify({from:config.MAIL_FROM,to:[config.NOTIFICATION_EMAIL],reply_to:item.email,subject:'Interview Prep Trail: new '+item.role+' question',text:`Name: ${item.name}\nEmail: ${item.email}\nProfile: ${item.role}\n\n${item.question}\n\nReference: ${item.id}`})});
  if(response.ok){const body=await response.json() as {id?:string};status=body.id?'accepted':'unknown';}else status='failed';
 }catch{console.error('Owner email notification not confirmed');}
 try{await db.prepare('UPDATE submissions SET email_status = ? WHERE id = ?').bind(status,item.id).run();}catch{console.error('Owner email status could not be saved');}
}
