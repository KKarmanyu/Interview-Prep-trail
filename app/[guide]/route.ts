import pages from '../../generated/guide-pages';
import { securityHeaders } from '../../lib/security-headers';
export function GET(request:Request){
 const key=new URL(request.url).pathname.replace(/^\//,'').replace(/\/$/,'');
 const page=(pages as Record<string,string>)[key];
 return new Response(page||'Page not found',{status:page?200:404,headers:{...securityHeaders,'Content-Type':page?'text/html; charset=utf-8':'text/plain; charset=utf-8'}});
}
