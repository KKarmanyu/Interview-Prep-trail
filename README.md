# Interview Prep Trail

Public interview preparation for Project Managers, Scrum Masters, Product Managers, Product Owners and AI Project Managers.

## Hosting status
This repository is a source snapshot of the working Sites-hosted application. Uploading it to GitHub does not publish it on GitHub Pages. The question form uses a Cloudflare Worker and D1 database; GitHub Pages cannot run those server features. Keep the existing hosting active until a separate migration has been implemented and tested.

Live site: https://interview-ready.karmanyu-korveni-52.chatgpt.site

## Content and validation
Edit content/questions.json and content/sources.json, then run python create.py and python render.py. Run node tests/security.cjs and python tests/seo.py after installing the locked dependencies. Read EDITORIAL.md for content requirements.

## Private data
This export includes no visitor database, credentials, runtime environment files, Git history or visitor reply content. content/replies.json is an empty placeholder. Never commit private visitor replies or secrets. Runtime email and human-verification services require separate configuration.

## Publishing
The current build uses the Sites/Vinext runtime. Existing Sites project metadata is retained to identify the existing site; it is not a credential. This is not a standalone GitHub Pages deployment package. Future daily updates currently target the Sites source repository, not this GitHub copy. Automatic GitHub synchronization is not configured.
