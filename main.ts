// Leonida Platinum — GTA VI trophy guide entrypoint.
//
// This program assembles the submission: it copies the static guide
// (app/) and the screenshots (screenshots/) into the grading output
// directory, then writes dossier.json with the kit's own dossier
// builder, so the scorer reads exactly what the judge sees.
//
// Run it locally with:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// and open the guide itself with any static server, for example:
//   python3 -m http.server 8080 --directory app

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repo = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(repo, 'app');
const shotsDir = join(repo, 'screenshots');

function requireDir(path, label) {
  if (!existsSync(path)) throw new Error('missing ' + label + ' directory: ' + path);
}

// The guide data is the heart of the entry: fail loudly when it is not
// a valid 55-trophy list, instead of handing in a broken dossier.
const raw = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf8'));
const list = Array.isArray(raw) ? raw : raw.trophies;
if (!Array.isArray(list) || list.length !== 55) {
  throw new Error('expected 55 trophies in app/data/trophies.json, found ' + (Array.isArray(list) ? list.length : 'none'));
}
const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
for (const t of list) {
  if (!(t.grade in grades)) throw new Error('trophy ' + t.id + ' has unknown grade: ' + t.grade);
  grades[t.grade] += 1;
}
if (grades.platinum !== 1 || grades.gold !== 2 || grades.silver !== 6 || grades.bronze !== 46) {
  throw new Error('unexpected grade split: ' + JSON.stringify(grades));
}
// Every trophy needs a guide the entrant wrote and a named source for it:
// a guide that only repeats the official description adds nothing.
for (const t of list) {
  if (typeof t.guide !== 'string' || t.guide.trim().length < 80) {
    throw new Error('trophy ' + t.id + ' (' + t.name + ') has no real guide text');
  }
  if (typeof t.source !== 'string' || !t.source.trim() || typeof t.source_url !== 'string' || !t.source_url.startsWith('https://')) {
    throw new Error('trophy ' + t.id + ' (' + t.name + ') names no source');
  }
}

requireDir(appDir, 'app');
mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });

mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(
  'Leonida Platinum: ' + list.length + ' trophies (' +
  grades.platinum + ' platinum, ' + grades.gold + ' gold, ' +
  grades.silver + ' silver, ' + grades.bronze + ' bronze), dossier written to ' +
  join(outDir, 'dossier.json'),
);
if (existsSync(shotsDir)) {
  const shots = readdirSync(shotsDir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
  for (const shot of shots) {
    const bytes = statSync(join(shotsDir, shot)).size;
    if (bytes > 262144) throw new Error('screenshot over the 256 KiB cap: ' + shot + ' (' + bytes + ' bytes)');
  }
  console.log('screenshots: ' + shots.length + ' (' + shots.join(', ') + '), all within 256 KiB');
}
