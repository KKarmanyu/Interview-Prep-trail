import { env } from 'cloudflare:workers';
export function GET(){
 const config=env as unknown as Record<string,string|undefined>;
 return Response.json({siteKey:config.TURNSTILE_SITE_KEY||null},{headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'}});
}
