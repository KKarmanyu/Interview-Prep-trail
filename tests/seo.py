import json,xml.etree.ElementTree as ET
from pathlib import Path
pages=json.loads(Path('generated/guide-pages.ts').read_text()[15:-2])
questions=json.loads(Path('content/questions.json').read_text())
assert len(pages)==5
for slug,page in pages.items():
 role=slug.removesuffix('-interview-questions')
 assert page.count('class="question-card"')==sum(q['role']==role for q in questions)
 assert '<h1>' in page and 'rel="canonical"' in page and 'name="description"' in page
 assert 'korvenikarmanyu@gmail.com' not in page
assert len(ET.fromstring(Path('public/sitemap.xml').read_text()))==6
assert 'Disallow: /api/' in Path('public/robots.txt').read_text()
print('PASS: role guides, question counts, canonical/description/H1, sitemap, API crawl exclusion, no owner email in guides')
