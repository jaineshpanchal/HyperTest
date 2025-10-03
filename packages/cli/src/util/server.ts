import http from 'node:http';
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { spawn } from 'node:child_process';

function listDirs(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .map(d => ({ d, p: path.join(root, d) }))
    .filter(({ p }) => existsSync(p) && statSync(p).isDirectory())
    .sort((a, b) => statSync(b.p).mtimeMs - statSync(a.p).mtimeMs)
    .map(({ d }) => d);
}

function listFiles(root: string, ext: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter(f => f.endsWith(ext))
    .map(f => ({ f, p: path.join(root, f) }))
    .sort((a, b) => statSync(b.p).mtimeMs - statSync(a.p).mtimeMs)
    .map(({ f }) => f);
}

function newestRunDir(root: string): string | null {
  const runs = listDirs(root);
  return runs[0] ?? null;
}

function withCors(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function startArtifactsServer({
  artifactsDir = 'artifacts',
  port = 4321
}: { artifactsDir?: string; port?: number }) {
  const server = http.createServer((req, res) => {
    const reqUrl = req.url || '/';
    const { pathname } = url.parse(reqUrl);

    withCors(res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

    // --- Trigger an example test run
    if (req.method === 'POST' && pathname === '/trigger/example') {
      const child = spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
        ['--filter', '@hypertest/example-basic-web-flow', 'test'],
        { stdio: 'ignore', detached: true, cwd: process.cwd() }
      );
      child.unref();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ pid: child.pid }));
    }

    // --- Trigger recorder for a url
    if (req.method === 'POST' && pathname === '/record') {
      let body = '';
      req.on('data', (c) => body += c);
      req.on('end', () => {
        try {
          const url = JSON.parse(body || '{}').url as string | undefined;
          const nodeExe = process.execPath;
          const cliPath = path.resolve(process.cwd(), 'packages', 'cli', 'dist', 'bin', 'hypertest.js');
          const child = spawn(nodeExe, [cliPath, 'record', url || 'https://example.com'],
            { stdio: 'ignore', detached: true, cwd: process.cwd() });
          child.unref();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ pid: child.pid }));
        } catch {
          res.statusCode = 400; res.end('Bad JSON');
        }
      });
      return;
    }

    // --- Runs listing/reading
    if (pathname === '/runs') {
      const runs = listDirs(artifactsDir);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(runs));
    }
    if (pathname === '/latest') {
      const latest = newestRunDir(artifactsDir);
      if (!latest) { res.statusCode = 404; return res.end('No runs found'); }
      const fp = path.join(artifactsDir, latest, 'run.jsonl');
      if (!existsSync(fp)) { res.statusCode = 404; return res.end('run.jsonl not found'); }
      res.setHeader('Content-Type', 'application/x-ndjson');
      return createReadStream(fp).pipe(res);
    }
    if (pathname && pathname.startsWith('/run/')) {
      const id = pathname.slice('/run/'.length);
      const fp = path.join(artifactsDir, id, 'run.jsonl');
      if (!existsSync(fp)) { res.statusCode = 404; return res.end('run.jsonl not found'); }
      res.setHeader('Content-Type', 'application/x-ndjson');
      return createReadStream(fp).pipe(res);
    }

    // --- Recordings listing/reading
    if (pathname === '/recordings') {
      const list = listFiles(path.join(artifactsDir, 'recordings'), '.jsonl');
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(list));
    }
    if (pathname && pathname.startsWith('/recording/')) {
      const id = pathname.slice('/recording/'.length); // e.g., 2025-...jsonl
      const fp = path.join(artifactsDir, 'recordings', id);
      if (!existsSync(fp)) { res.statusCode = 404; return res.end('recording not found'); }
      res.setHeader('Content-Type', 'application/x-ndjson');
      return createReadStream(fp).pipe(res);
    }

    // --- Static files under artifacts (videos, traces, etc.)
    const safePath = path.normalize(decodeURIComponent(pathname || '/'));
    const filePath = path.join(artifactsDir, safePath);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      return createReadStream(filePath).pipe(res);
    }

    res.statusCode = 404;
    res.end('Not found');
  });

  server.listen(port, () => {
    console.log(`HyperTest artifacts server running at http://localhost:${port}`);
    console.log(`• Latest run:        GET  /latest`);
    console.log(`• List runs:         GET  /runs`);
    console.log(`• Run by id:         GET  /run/<id>`);
    console.log(`• Trigger run:       POST /trigger/example`);
    console.log(`• Start recorder:    POST /record { "url": "https://…" }`);
    console.log(`• List recordings:   GET  /recordings`);
    console.log(`• Get recording:     GET  /recording/<file.jsonl>`);
  });

  return server;
}
