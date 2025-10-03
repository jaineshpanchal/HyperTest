import { defineConfig } from '@playwright/test';
import path from 'node:path';

// ESM-safe absolute path to the built reporter
const here = new URL('.', import.meta.url);
const reporterPath = new URL('../../packages/runner-web/dist/jsonl-reporter.js', here).pathname;

// Repo-root artifacts dir
const repoArtifacts = path.resolve(process.cwd(), '../../..', 'artifacts');

export default defineConfig({
  reporter: [
    ['line'],
    [reporterPath, { outDir: repoArtifacts }],
    ['junit', { outputFile: path.join(repoArtifacts, 'junit', 'results.xml') }]
  ],
  use: {
    headless: true,
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'only-on-failure'
  },
  outputDir: path.join(repoArtifacts, 'pw-output'),
  preserveOutput: 'always'
});
