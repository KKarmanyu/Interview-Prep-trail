"""Export the public question bank only; keep submissions on the existing backend."""
import json, os, re, shutil, subprocess, sys
from pathlib import Path
from urllib.parse import urlsplit
root=Path(__file__).resolve().parents[1]
base=os.environ.get('PAGES_BASE_URL','https://kkarmanyu.github.io/Interview-Prep-trail').rstrip('/')
parsed=urlsplit(base)
if parsed.scheme!='https' or not parsed.netloc or parsed.query or parsed.fragment:
 raise ValueError('PAGES_BASE_URL must be an HTTPS site URL without query or fragment')
basepath=parsed.path.rstrip('/')+'/'
backend='https://interview-ready.karmanyu-korveni-52.chatgpt.site'
out=root/'_site'
if out.exists():shutil.rmtree(out)
out.mkdir()
for script in ['create.py','render.py']:
 subprocess.run([sys.executable,str(root/script)],cwd=root,check=True)
# Explicit asset allowlist: never publish server files, replies, credentials or source.
for name in ['style.css','app.js','questions.js','questions.json','sources.json','workplace-hero.jpg','favicon.svg']:
 shutil.copyfile(root/'public'/name,out/name)
guides=json.loads((root/'generated/guide-pages.ts').read_text().removeprefix('export default ').strip().removesuffix(';'))
def transform(page,home=False):
 page=page.replace(backend,base)
 if home:
  page,count=re.subn(r'<section id="ask".*?</section>', '<section id="ask" class="ask-section"><div><h2>Ask a question</h2><p>Use our secure hosted form to submit your question and check your reply. It opens on our existing website.</p><p><a href="'+backend+'/#ask">Open the question form</a></p></div></section>',page,count=1,flags=re.S)
  assert count==1,'Question form was not found; refusing to publish a broken form'
  page=page.replace('<script src="ask.js" defer></script>','')
 else:
  page=page.replace('href="/#ask"','href="'+backend+'/#ask"')
 # Root-relative routes must include this repository's path; directory indexes use trailing slash.
 for slug in guides:
  page=page.replace('href="/'+slug+'"','href="'+basepath+slug+'/"')
  page=page.replace('href="'+base+'/'+slug+'"','href="'+base+'/'+slug+'/"')
 page=page.replace('href="/style.css"','href="'+basepath+'style.css"').replace('href="/"','href="'+basepath+'"')
 if home:page=page.replace('<head>','<head><base href="'+base+'/">',1)
 assert '/api/' not in page and 'ask.js' not in page and '<form' not in page
 return page
(out/'index.html').write_text(transform((root/'public/index.html').read_text(),True))
for slug,page in guides.items():
 d=out/slug;d.mkdir();(d/'index.html').write_text(transform(page))
(out/'.nojekyll').write_text('')
(out/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+base+path+'</loc></url>' for path in ['/']+['/'+s+'/' for s in guides])+'</urlset>')
# robots.txt only controls crawling when hosted at the domain root.
(out/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+base+'/sitemap.xml\n')
print('Built GitHub Pages question bank:',len(guides),'role guides. Submission form links to existing backend.')
