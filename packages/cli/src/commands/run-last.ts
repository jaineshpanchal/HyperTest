import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { newestFile } from '../util/fs.js';
import { open } from './open.js';

export async function runLast(opts?: { openServer?: boolean }) {
  const repo = process.cwd();
  const testsDir = path.join(repo, 'examples', 'basic-web-flow', 'tests');
  if (!fs.existsSync(testsDir)) {
    console.error(pc.red('Tests dir not found: ' + testsDir));
    process.exit(1);
  }
  const specAbs = newestFile(testsDir, f => f.endsWith('.spec.ts'));
  if (!specAbs) {
    console.error(pc.red('No spec files in ' + testsDir));
    process.exit(1);
  }
  if (opts?.openServer) {
    await open(); // serves artifacts on http://localhost:4321
  }
  const rel = path.relative(repo, specAbs);
  const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const child = spawn(
    cmd,
    ['--filter','@hypertest/example-basic-web-flow','exec','playwright','test', rel],
    { stdio: 'inherit', cwd: repo }
  );
  child.on('close', code => process.exit(code ?? 1));
}
