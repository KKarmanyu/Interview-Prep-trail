import html from '../generated/site-html';
import { securityHeaders } from '../lib/security-headers';
export function GET(request:Request){return new Response(html,{headers:{...securityHeaders,'Content-Type':'text/html; charset=utf-8',...(new URL(request.url).searchParams.has('ticket')?{'X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}:{})}});}
