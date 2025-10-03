import { spawn } from 'node:child_process';
import path from 'node:path';
import pc from 'picocolors';
import { startArtifactsServer } from '../util/server.js';

type RunOptions = {
  config?: string;
  openServer?: boolean;
  serverPort?: number;
  retries?: number;
};

function runPlaywright({ config, cwd, retries }: { config: string; cwd: string; retries?: number }): Promise<number> {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    const cfgName = path.basename(config);
    const args = ['exec', 'playwright', 'test', '--config', cfgName];
    if (typeof retries === 'number' && !Number.isNaN(retries)) {
      args.push('--retries', String(retries));
    }
    const child = spawn(cmd, args, { stdio: 'inherit', cwd });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

export async function run(opts: RunOptions & { project?: string }) {
  const repoRoot = process.cwd();
  const config =
    opts.config ??
    process.env.HYPERTEST_PW_CONFIG ??
    path.join(repoRoot, 'examples', 'basic-web-flow', 'playwright.config.ts');

  const retries =
    typeof opts.retries === 'number'
      ? opts.retries
      : (process.env.HYPERTEST_RETRIES ? Number(process.env.HYPERTEST_RETRIES) : undefined);

  const cfgDir = path.dirname(config);

  if (opts.openServer) {
    const port = Number(opts.serverPort || process.env.HYPERTEST_PORT || 4321);
    startArtifactsServer({ artifactsDir: 'artifacts', port });
    console.log(pc.green(`✔ Serving artifacts on http://localhost:${port}`));
  }

  console.log(pc.cyan(`▶ Running Playwright with config: ${config}${retries !== undefined ? ` (retries=${retries})` : ''}`));
  const code = await runPlaywright({ config, cwd: cfgDir, retries });
  if (code === 0) console.log(pc.green('✔ Tests passed'));
  else console.log(pc.red(`✖ Tests failed with exit code ${code}`));
  if (process.env.HYPERTEST_NO_EXIT !== '1') process.exit(code);
}
