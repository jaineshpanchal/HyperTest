import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { newestFile } from '../util/fs.js';

export async function listAll() {
  const repo = process.cwd();
  const recDir = path.join(repo, 'artifacts', 'recordings');
  const specDir = path.join(repo, 'examples', 'basic-web-flow', 'tests');

  const recOk = fs.existsSync(recDir);
  const specOk = fs.existsSync(specDir);

  console.log(pc.bold('Recordings:'));
  if (!recOk) {
    console.log('  (dir missing)', recDir);
  } else {
    const files = fs.readdirSync(recDir).filter(f => f.endsWith('.jsonl')).sort().slice(-10);
    if (!files.length) console.log('  (none)');
    for (const f of files) console.log('  -', f);
    const newest = newestFile(recDir, f => f.endsWith('.jsonl'));
    if (newest) console.log(pc.dim('  newest → ' + path.basename(newest)));
  }

  console.log('\n' + pc.bold('Specs:'));
  if (!specOk) {
    console.log('  (dir missing)', specDir);
  } else {
    const files = fs.readdirSync(specDir).filter(f => f.endsWith('.spec.ts')).sort().slice(-10);
    if (!files.length) console.log('  (none)');
    for (const f of files) console.log('  -', f);
    const newest = newestFile(specDir, f => f.endsWith('.spec.ts'));
    if (newest) console.log(pc.dim('  newest → ' + path.basename(newest)));
  }
}
