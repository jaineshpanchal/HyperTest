import fs from 'node:fs';
import path from 'node:path';
import type {
  Reporter,
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult
} from '@playwright/test/reporter';

type JsonlEvent =
  | { type: 'runStart'; runId: string; startTime: number }
  | { type: 'testStart'; runId: string; testId: string; title: string }
  | { type: 'step'; runId: string; testId: string; message: string }
  | { type: 'artifact'; runId: string; testId: string; kind: string; path: string }
  | { type: 'pass'; runId: string; testId: string; duration: number }
  | { type: 'fail'; runId: string; testId: string; error: string; duration: number }
  | { type: 'runEnd'; runId: string; endTime: number };

interface Options {
  outDir?: string;        // default: "artifacts"
  runId?: string;         // default: timestamp
}

function writeLine(fp: string, ev: JsonlEvent) {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.appendFileSync(fp, JSON.stringify(ev) + '\n');
}

class JsonlReporter implements Reporter {
  private runId!: string;
  private outDir!: string;
  private filePath!: string;
  private startedAt = Date.now();

  constructor(opts?: Options) {
    this.outDir = opts?.outDir ?? 'artifacts';
    this.runId = opts?.runId ?? new Date().toISOString().replace(/[:.]/g, '-');
    this.filePath = path.join(this.outDir, this.runId, 'run.jsonl');
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    writeLine(this.filePath, { type: 'runStart', runId: this.runId, startTime: this.startedAt });
  }

  onTestBegin(test: TestCase) {
    writeLine(this.filePath, {
      type: 'testStart',
      runId: this.runId,
      testId: test.id,
      title: test.titlePath().join(' › ')
    });
  }

  onStdOut(chunk: string | Buffer, test?: TestCase) {
    if (!test) return;
    writeLine(this.filePath, {
      type: 'step',
      runId: this.runId,
      testId: test.id,
      message: chunk.toString().trim()
    });
  }

  onStdErr(chunk: string | Buffer, test?: TestCase) {
    if (!test) return;
    writeLine(this.filePath, {
      type: 'step',
      runId: this.runId,
      testId: test.id,
      message: chunk.toString().trim()
    });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed') {
      writeLine(this.filePath, {
        type: 'pass',
        runId: this.runId,
        testId: test.id,
        duration: result.duration
      });
    } else if (result.status === 'failed') {
      const error = result.error ? (result.error.message || String(result.error)) : 'Unknown error';
      writeLine(this.filePath, {
        type: 'fail',
        runId: this.runId,
        testId: test.id,
        error,
        duration: result.duration
      });
    }
    // emit file artifacts, converted to relative paths under outDir
    for (const a of result.attachments ?? []) {
      if (a.path) {
        const rel = a.path.startsWith(this.outDir)
          ? path.relative(this.outDir, a.path)
          : a.path; // if Playwright wrote outside, keep as-is
        writeLine(this.filePath, {
          type: 'artifact',
          runId: this.runId,
          testId: test.id,
          kind: a.name || a.contentType || 'attachment',
          path: rel.replaceAll('\\', '/')
        });
      }
    }
  }

  async onEnd(_result: FullResult) {
    writeLine(this.filePath, { type: 'runEnd', runId: this.runId, endTime: Date.now() });
  }
}

export default JsonlReporter;
