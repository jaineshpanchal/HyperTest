//!/usr/bin/env node
import { Command } from 'commander';

import { open } from '../src/commands/open.js';
import { run } from '../src/commands/run.js';
import { record } from '../src/commands/record.js';
import { generate } from '../src/commands/generate.js';

import { runSpec } from '../src/commands/run-spec.js';
import { genLast } from '../src/commands/gen-last.js';
import { runLast } from '../src/commands/run-last.js';
import { listAll } from '../src/commands/list.js';

const program = new Command();
program
  .name('hypertest')
  .description('HyperTest CLI')
  .version('0.0.0');

program.command('open')
  .description('Open dashboard / serve artifacts')
  .action(() => open());

program.command('run')
  .description('Run the example suite')
  .option('--open-server', 'Start artifacts server before running')
  .action(async (opts) => run(opts));

program.command('record')
  .description('Record a session into artifacts/recordings/*.jsonl')
  .argument('[url]', 'Start URL (default: https://example.com)')
  .action(async (url) => record(url));

program.command('generate')
  .description('Generate a spec from a recording')
  .requiredOption('--file <recording.jsonl>', 'Recording file (absolute, repo-relative, or basename)')
  .requiredOption('--url <url>', 'Start URL to use in the test')
  .option('--name <slug>', 'Optional output file slug')
  .action(async (opts) => generate(opts));

program.command('run-spec')
  .description('Run a single spec using Playwright in the example app')
  .argument('<file>', 'Spec file path relative to repo root')
  .action(async (file) => runSpec(file));

program.command('gen-last')
  .description('Generate a spec from the newest recording in artifacts/recordings')
  .requiredOption('--url <url>', 'Start URL to use in the test')
  .action(async (opts) => genLast(opts.url));

program.command('run-last')
  .description('Run the newest spec in examples/basic-web-flow/tests')
  .option('--open-server', 'Start artifacts server on port 4321 before running')
  .action(async (opts) => runLast({ openServer: !!opts.openServer }));

program.command('list')
  .description('List recent recordings and specs')
  .action(async () => listAll());

program.parse(process.argv);
