import { verifyHuman } from '../../../lib/verify-human';
import { inbox } from '../../../db/inbox';
import { notifyOwner } from '../../../lib/notify-owner';
import replies from '../../../content/replies.json';
const roles=new Set(['project-manager','scrum-master','product-manager','product-owner','ai-project-manager']);
const validId=(id:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
function result(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});}
export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get('id')||'';
 if(!validId(id))return result({error:'Use the reply link you received after submitting.'},400);
 try{
  const row=await inbox().prepare('SELECT role, question, created_at FROM submissions WHERE id = ?').bind(id).first();
  if(!row)return result({error:'Reply link not found. Check that you copied the complete link.'},404);
  const reply=(replies as Record<string,{answer:string;answeredAt:string}>)[id];
  return result({...row,status:reply?'answered':'pending',answer:reply?.answer||null,answeredAt:reply?.answeredAt||null});
 }catch{console.error('Question lookup failed');return result({error:'Replies are temporarily unavailable. Please try again later.'},503);}
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return result({error:'Submit from the Interview Prep Trail website.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return result({error:'Invalid submission format.'},415);
 try{
  const reader=request.body?.getReader();if(!reader)return result({error:'Please enter your question.'},400);
  let size=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>10000){await reader.cancel();return result({error:'Your question is too long.'},413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let data;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{return result({error:'Invalid submission format.'},400);}
  if(!data||typeof data!=='object')return result({error:'Invalid question.'},400);
  const question=typeof data.question==='string'?data.question.trim():'';
  const name=typeof data.name==='string'?data.name.trim():'';
  const email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
  if(name.length<2||name.length>100||/[\r\n\x00-\x1f]/.test(name)||email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return result({error:'Enter your name and a valid email address. Both are required.'},400);
  if(data.website)return result({error:'Unable to accept this submission.'},400);
  if(typeof data.id!=='string'||!validId(data.id)||!roles.has(data.role)||question.length<15||question.length>2000)return result({error:'Choose a profile and enter a question between 15 and 2,000 characters.'},400);
  const human=await verifyHuman(data.humanToken,request.headers.get('cf-connecting-ip'),new URL(request.url).hostname);
  if(human!=='ok')return result({error:human==='rejected'?'Complete the human verification and try again.':'Human verification is unavailable. Please try again later.'},human==='rejected'?403:503);
  const db=inbox();const existing=await db.prepare('SELECT id FROM submissions WHERE id = ?').bind(data.id).first();
  if(existing)return result({id:data.id},200);
  const now=Date.now(),cutoff=now-24*60*60*1000;
  const ip=request.headers.get('cf-connecting-ip');
  if(!ip)return result({error:'Unable to verify your connection. Please try again later.'},503);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('submission-ip:'+ip));
  const clientHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  // One atomic SQL statement prevents concurrent requests bypassing the quota.
  const inserted=await db.prepare('INSERT INTO submissions (id,role,question,created_at,client_hash,name,email) SELECT ?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM submissions WHERE created_at > ? AND (client_hash = ? OR lower(email) = ?)) < 3').bind(data.id,data.role,question,now,clientHash,name,email,cutoff,clientHash,email).run();
  if(!inserted.meta.changes){
   const oldest=await db.prepare('SELECT MIN(created_at) AS oldest FROM submissions WHERE created_at > ? AND (client_hash = ? OR lower(email) = ?)').bind(cutoff,clientHash,email).first<{oldest:number}>();
   const retryAfter=Math.max(1,Math.ceil(((oldest?.oldest||now)+86400000-now)/1000));
   const response=result({error:'You have reached the limit of 3 questions in 24 hours for this email or network. Try again when your oldest submission is 24 hours old.',retryAfter},429);
   response.headers.set('Retry-After',String(retryAfter));return response;
  }
  await notifyOwner({id:data.id,name,email,role:data.role,question},db);
  return result({id:data.id},201);
 }catch{console.error('Question submission failed');return result({error:'Your question could not be saved. Keep your text and try again later.'},503);}
}
