// node tools/csp-hash.mjs game/index.html  -> prints the CSP hashes for the inline <script>/<style>.
// Use it when building the iOS app, where the page is bundled and a strict CSP is worth adding.
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const html=readFileSync(process.argv[2],'utf8');
const h=t=>`'sha256-${createHash('sha256').update(t,'utf8').digest('base64')}'`;
for(const [tag,re] of [['script',/<script>([\s\S]*?)<\/script>/g],['style',/<style>([\s\S]*?)<\/style>/g]])
  for(const m of html.matchAll(re))console.log(tag+'-src',h(m[1]));
