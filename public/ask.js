(()=>{
const form=document.getElementById('ask-form'),button=document.getElementById('ask-submit'),message=document.getElementById('ask-message');
function newId(){const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);}
let humanToken='',widgetId=null,configReady=false;
button.disabled=true;
async function prepareVerification(){
 try{
  const response=await fetch('/api/submission-config',{cache:'no-store'});if(!response.ok)throw new Error();
  const config=await response.json();
  if(config.siteKey){
   const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
   script.onload=()=>{widgetId=window.turnstile.render('#human-check',{sitekey:config.siteKey,action:'submit-question',callback:token=>{humanToken=token;button.disabled=false;},'expired-callback':()=>{humanToken='';button.disabled=true;},'error-callback':()=>{humanToken='';button.disabled=true;message.textContent='Human verification failed. Reload this page to try again.';}});configReady=true;};
   script.onerror=()=>{message.textContent='Human verification could not load. Reload this page to try again.';};document.head.appendChild(script);
  }else{configReady=true;button.disabled=false;}
 }catch{message.textContent='The question form is temporarily unavailable. Reload this page to try again.';}
}
prepareVerification();
let ticket=new URL(location.href).searchParams.get('ticket');let submissionId=newId();
async function loadReply(){
 if(!ticket)return;document.getElementById('reply-panel').hidden=false;
 const link=new URL(location.href);link.search='';link.searchParams.set('ticket',ticket);link.hash='ask';const a=document.getElementById('reply-link');a.href=link.href;
 const status=document.getElementById('reply-status');status.textContent='Checking your reply…';
 try{const response=await fetch('/api/questions?id='+encodeURIComponent(ticket),{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to check your reply.');document.getElementById('reply-question').textContent=data.question;
 status.textContent=data.status==='answered'?'Your reply is ready.':'Your question is waiting for review. We aim to reply within 24 hours; save this link and check back.';
 document.getElementById('reply-answer').textContent=data.answer||'';
 }catch(error){status.textContent=error.message||'Replies are unavailable. Please try again later.';}
}
form.addEventListener('submit',async event=>{event.preventDefault();if(!configReady)return;button.disabled=true;message.textContent='Saving your question…';
 try{const response=await fetch('/api/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({humanToken,id:submissionId,name:document.getElementById('ask-name').value,email:document.getElementById('ask-email').value,role:document.getElementById('ask-role').value,question:document.getElementById('ask-question').value,website:document.getElementById('ask-website').value})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to submit.');ticket=data.id;submissionId=newId();message.textContent='Question received for review. Save your private reply link below to check for an answer.';form.reset();await loadReply();
 }catch(error){message.textContent=error.message||'Could not save your question. Your text is still here.';}finally{if(widgetId!==null){humanToken='';window.turnstile.reset(widgetId);button.disabled=true;}else{button.disabled=false;}}});
document.getElementById('reply-refresh').addEventListener('click',loadReply);loadReply();
})();
