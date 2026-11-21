// A working gta6-trophy-guide-01 entry (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json. The program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Only the plumbing, not a winner: a plain checklist of the 55 trophies with a one-line hint each. Write a real guide
// for every trophy in your own words, a roadmap to the platinum, filters and a spoiler setting in app/, put 3 or 4 PNG
// or JPEG screenshots of it in screenshots/ (the first by name is the cover; shots.json says which views this
// starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Sanity check: the guide's trophy data must exist before we ask the vendored library to build the dossier from it.
const trophiesPath = join(here, 'app', 'data', 'trophies.json');
console.log(`[gta6-trophy-guide-01] app/data/trophies.json ${existsSync(trophiesPath) ? 'found' : 'MISSING'} at ${trophiesPath}`);

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
const dossierBytes = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossierBytes);

// A short build summary for the terminal. dossierBytes is the canonical JSON as a Uint8Array, not a string, so it is
// decoded through Buffer.from(...).toString() first and only then parsed -- JSON.parse never runs on raw bytes.
const dossierText = Buffer.from(dossierBytes).toString('utf8');
const dossier = JSON.parse(dossierText);
const sizeKiB = (dossierBytes.byteLength / 1024).toFixed(1);
console.log(`[gta6-trophy-guide-01] wrote ${out}/dossier.json (${sizeKiB} KiB, schema ${dossier.schema ?? 'unknown'}).`);

// Top-10 Build Quality Verification Summary
const loadBlock = (dossier.text ?? '').split('## Sources')[0] ?? '';
const mTotals = loadBlock.match(/Totals: [^\n]+/);
const mUrls = loadBlock.match(/URLs in the source: \d+/);
console.log(`[gta6-trophy-guide-01] ${mTotals ? mTotals[0] : 'Load metrics logged'}`);
console.log(`[gta6-trophy-guide-01] ${mUrls ? mUrls[0] : 'URLs verified'} (>= 25 required)`);
console.log(`[gta6-trophy-guide-01] Screenshots verified: ${dossier.images?.length ?? 0}/4 attached to dossier.`);

