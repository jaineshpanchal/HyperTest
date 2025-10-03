import path from 'node:path';
import pc from 'picocolors';
import { generate } from './generate.js';
import { newestFile } from '../util/fs.js';

export async function genLast(url?: string) {
  if (!url) { console.error(pc.red('Missing --url <start url>')); process.exit(1); }
  const repo = process.cwd();
  const recDir = path.join(repo, 'artifacts', 'recordings');
  const recAbs = newestFile(recDir, f => f.endsWith('.jsonl'));
  if (!recAbs) { console.error(pc.red('No recordings found in artifacts/recordings')); process.exit(1); }
  const file = path.basename(recAbs);
  await generate({ file, url });
}
