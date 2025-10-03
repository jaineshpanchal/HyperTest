import fs from 'node:fs';
import path from 'node:path';
export function newestFile(dir: string, predicate = (_: string) => true): string | null {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(predicate);
  if (!files.length) return null;
  const items = files.map(f => ({ p: path.join(dir, f), m: fs.statSync(path.join(dir, f)).mtimeMs }));
  items.sort((a,b) => b.m - a.m);
  return items[0].p;
}
