import { spawn } from 'node:child_process';
export async function runSpec(specPath: string) {
  const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const child = spawn(
    cmd,
    ['--filter','@hypertest/example-basic-web-flow','exec','playwright','test', specPath],
    { stdio: 'inherit', cwd: process.cwd() }
  );
  child.on('close', code => process.exit(code ?? 1));
}
