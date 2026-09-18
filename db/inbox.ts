import { env } from 'cloudflare:workers';
export function inbox(){if(!env.DB)throw new Error('Question inbox unavailable');return env.DB;}
