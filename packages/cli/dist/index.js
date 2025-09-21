#!/usr/bin/env node
import { runAgent } from "@hypertest/agent";
import { run } from "@hypertest/orchestrator";
import fs from "node:fs";
import path from "node:path";
function parseFlags(argv) {
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith("--")) {
            const [k, v] = a.split("=");
            if (v !== undefined)
                out[k.slice(2)] = v;
            else if (argv[i + 1] && !argv[i + 1].startsWith("-"))
                out[k.slice(2)] = argv[++i];
            else
                out[k.slice(2)] = true;
        }
    }
    return out;
}
function saveArtifacts(results) {
    const root = path.resolve(process.cwd(), "artifacts");
    if (!fs.existsSync(root))
        fs.mkdirSync(root, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.join(root, `run-${stamp}`);
    fs.mkdirSync(dir);
    const summary = results.map((r) => ({ message: r.message, artifacts: r.artifacts ?? {} }));
    fs.writeFileSync(path.join(dir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
    // If any step returns inline content, persist it (e.g., generated script)
    for (const r of results) {
        const a = r.artifacts ?? {};
        if (a.content && a.script) {
            const abs = path.join(dir, path.basename(a.script));
            fs.writeFileSync(abs, a.content, "utf8");
        }
    }
    console.log(`[cli] artifacts saved to ${dir}`);
}
async function main() {
    const [, , cmd, ...rest] = process.argv;
    switch (cmd) {
        case "agent": {
            const flags = parseFlags(rest);
            const prompt = rest.filter((s) => !s.startsWith("--")).join(" ").trim() ||
                "Create a basic smoke test for https://example.com (login + happy path).";
            // Optional provider overrides via flags
            if (flags.provider)
                process.env.HYPERTEST_PROVIDER = String(flags.provider);
            if (flags.model)
                process.env.OPENAI_MODEL = String(flags.model);
            if (flags.key)
                process.env.OPENAI_API_KEY = String(flags.key);
            const results = await runAgent({ prompt, target: "web" });
            console.log("[agent] results:");
            for (const r of results)
                console.log("-", r.message);
            saveArtifacts(results);
            return;
        }
        case "help":
        case "-h":
        case "--help": {
            console.log(`HyperTest CLI

Usage:
  hypertest                   Run default orchestrator (stub)
  hypertest agent "<goal>"    Plan → record/script → run using the Agent

Flags (agent):
  --provider <stub|openai>
  --model <name>          (OPENAI) default: gpt-4o-mini
  --key <api_key>         (OPENAI) or set OPENAI_API_KEY in env
`);
            return;
        }
        default: {
            run();
            return;
        }
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
