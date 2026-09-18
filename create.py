import json
from pathlib import Path
p=Path(__file__).parent
out=p/'public'
questions=json.loads((p/'content/questions.json').read_text())
sources=json.loads((p/'content/sources.json').read_text())
assert len({q['id'] for q in questions})==len(questions)
for q in questions:
 assert all(k in sources for k in q['sources'])
for name,data in [('questions',questions),('sources',sources)]:
 (out/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2))
(out/'questions.js').write_text('const questions = '+json.dumps(questions,ensure_ascii=False)+';\nconst sources = '+json.dumps(sources,ensure_ascii=False)+';')
print('Generated content assets from canonical content files')
