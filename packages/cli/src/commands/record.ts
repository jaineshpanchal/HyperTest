import path from 'node:path';
import fs from 'node:fs';
import pc from 'picocolors';
import { chromium, ConsoleMessage, Page } from 'playwright';

export async function record(url?: string) {
  const repo = process.cwd();

  // Prepare output file FIRST
  const recordingsDir = path.resolve(repo, 'artifacts', 'recordings');
  fs.mkdirSync(recordingsDir, { recursive: true });
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(recordingsDir, `${runId}.jsonl`);

  const startUrl = url || 'https://example.com';
  fs.appendFileSync(outFile, JSON.stringify({ ts: Date.now(), type: 'sessionStart', url: startUrl }) + '\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Read injector (ok if empty)
  const injectPath = path.resolve(repo, 'packages', 'recorder', 'dist', 'inject.js');
  const script = fs.existsSync(injectPath) ? fs.readFileSync(injectPath, 'utf8') : '';

  // Expose the binding ONCE at the context level
  const BINDING = '__hypertest_rec';
  await context.exposeBinding(BINDING, (_source, payload: any) => {
    try {
      fs.appendFileSync(outFile, JSON.stringify({ ts: Date.now(), type: 'click', target: payload }) + '\n');
    } catch {}
  });

  // Install injector at context level so it reaches all frames early
  if (script) await context.addInitScript({ content: script });
  // Debug handshake in case injector is empty/missing
  await context.addInitScript({ content: `console.log('HT_READY')` });

  // Attach console echo + fallback on every page
  const onConsole = (msg: ConsoleMessage) => {
    const text = msg.text?.();
    if (text) console.log(pc.dim(`[console] ${text}`));
    if (text?.startsWith('HT_REC ')) {
      try {
        const target = JSON.parse(text.slice('HT_REC '.length));
        fs.appendFileSync(outFile, JSON.stringify({ ts: Date.now(), type: 'click', target }) + '\n');
      } catch {}
    }
  };

  const wirePage = async (page: Page) => {
    // Do NOT exposeBinding here (already done at context-level)
    page.on('console', onConsole);
    // Also add page-level init script as belt & suspenders
    if (script) await page.addInitScript({ content: script });
    await page.addInitScript({ content: `console.log('HT_READY_PAGE')` });
  };

  context.on('page', wirePage);

  // Open first page, wire before navigating
  const page = await context.newPage();
  await wirePage(page);

  console.log(pc.cyan(`Recorder injected. Opening: ${startUrl}`));
  console.log(pc.dim('Hover to highlight; click or press Alt+C to capture. Alt+R toggle, Alt+X remove.'));
  // Navigate AFTER wiring so we don't miss early events
  await page.goto(startUrl);

  // Wait until the window is closed
  await page.waitForEvent('close');

  fs.appendFileSync(outFile, JSON.stringify({ ts: Date.now(), type: 'sessionEnd' }) + '\n');
  await context.close();
  await browser.close();

  console.log(pc.green(`Saved recording → ${outFile}`));
}
