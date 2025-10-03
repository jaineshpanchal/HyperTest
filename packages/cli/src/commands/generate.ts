import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

type RecLine = { ts: number; type?: string; target?: any };

function toSafeName(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'recording';
}

function resolveRecordingPath(input: string, repo: string): string {
  if (path.isAbsolute(input)) return input;
  if (input.includes(path.sep)) return path.resolve(repo, input); // e.g. "artifacts/recordings/.."
  return path.join(repo, 'artifacts', 'recordings', input);       // basename
}

export async function generate(opts: { file?: string; url?: string; name?: string }) {
  const repo = process.cwd();
  const file = opts.file;
  if (!file) { console.error(pc.red('Missing --file <recording.jsonl>')); process.exit(1); }
  if (!opts.url) { console.error(pc.red('Missing --url <start url>')); process.exit(1); }

  const recPath = resolveRecordingPath(file, repo);
  if (!fs.existsSync(recPath)) { console.error(pc.red(`Recording not found: ${recPath}`)); process.exit(1); }

  const lines = fs.readFileSync(recPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const events: RecLine[] = [];
  for (const l of lines) { try { events.push(JSON.parse(l)); } catch {} }

  // Keep only click events with a target
  const clicks = events.filter(e => e && e.type === 'click' && e.target);
  if (!clicks.length) { console.error(pc.red('Recording contains no clicks.')); process.exit(1); }

  const name = opts.name || path.basename(recPath).replace(/\.jsonl$/i, '');
  const testName = `recorded: ${name}`;
  const startUrl = opts.url;

  const body: string[] = [];
  body.push(`import { test, expect, selector } from '@hypertest/runner-web';`);
  body.push('');
  body.push(`test(${JSON.stringify(testName)}, async ({ page }) => {`);
  body.push(`  await page.goto(${JSON.stringify(startUrl)});`);
  body.push(`  const s = selector(page);`);
  for (const ev of clicks) {
    body.push(`  await s.by(${JSON.stringify(ev.target)}).click();`);
  }
  body.push(`});`);
  body.push('');

  const outDir = path.join(repo, 'examples', 'basic-web-flow', 'tests');
  fs.mkdirSync(outDir, { recursive: true });
  const base = toSafeName(name);
  let out = path.join(outDir, `${base}.spec.ts`);
  for (let i = 2; fs.existsSync(out); i++) out = path.join(outDir, `${base}-${i}.spec.ts`);
  fs.writeFileSync(out, body.join('\n'));

  console.log(pc.green(`✔ Generated test → ${out}`));
  process.stdout.write(out);
}
