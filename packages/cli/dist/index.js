#!/usr/bin/env node
import { runAgent } from "@hypertest/agent";
import { run } from "@hypertest/orchestrator";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
/** Very small flag parser: supports --k v, --k=v, and boolean switches */
function parseFlags(argv) {
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith("--")) {
            const eq = a.indexOf("=");
            if (eq !== -1) {
                out[a.slice(2, eq)] = a.slice(eq + 1);
            }
            else if (argv[i + 1] && !argv[i + 1].startsWith("-")) {
                out[a.slice(2)] = argv[++i];
            }
            else {
                out[a.slice(2)] = true;
            }
        }
    }
    return out;
}
function ensureDir(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
function stampedDir(root = "artifacts", prefix = "run") {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.resolve(process.cwd(), root, `${prefix}-${stamp}`);
    ensureDir(dir);
    return dir;
}
function saveArtifacts(results, rootDir) {
    const root = path.resolve(process.cwd(), rootDir || "artifacts");
    ensureDir(root);
    const dir = stampedDir(root, "run");
    const summary = results.map((r) => ({
        message: r.message,
        artifacts: r.artifacts ?? {},
    }));
    fs.writeFileSync(path.join(dir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
    for (const r of results) {
        const a = r.artifacts ?? {};
        if (a.content && a.script) {
            const abs = path.join(dir, path.basename(a.script));
            fs.writeFileSync(abs, a.content, "utf8");
        }
    }
    console.log(`[cli] artifacts saved to ${dir}`);
}
function applyProviderEnv(flags) {
    if (flags.provider)
        process.env.HYPERTEST_PROVIDER = String(flags.provider);
    // OpenAI
    if (flags.model && (!flags.provider || String(flags.provider) === "openai")) {
        process.env.OPENAI_MODEL = String(flags.model);
    }
    if (flags.key && (!flags.provider || String(flags.provider) === "openai")) {
        process.env.OPENAI_API_KEY = String(flags.key);
    }
    // Ollama
    if (flags["ollama-model"])
        process.env.OLLAMA_MODEL = String(flags["ollama-model"]);
    if (flags["ollama-base"])
        process.env.OLLAMA_BASE_URL = String(flags["ollama-base"]);
    // LM Studio
    if (flags["lmstudio-base"])
        process.env.LMSTUDIO_BASE_URL = String(flags["lmstudio-base"]);
    if (flags["lmstudio-model"])
        process.env.LMSTUDIO_MODEL = String(flags["lmstudio-model"]);
}
function echoProviderBanner() {
    const p = (process.env.HYPERTEST_PROVIDER || "stub").toLowerCase();
    if (p === "openai") {
        console.log(`[agent] provider=openai model=${process.env.OPENAI_MODEL || "gpt-4o-mini"}`);
    }
    else if (p === "ollama") {
        console.log(`[agent] provider=ollama model=${process.env.OLLAMA_MODEL || "llama3.2"} base=${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}`);
    }
    else if (p === "lmstudio") {
        console.log(`[agent] provider=lmstudio model=${process.env.LMSTUDIO_MODEL || "(default)"} base=${process.env.LMSTUDIO_BASE_URL || "http://localhost:1234"}`);
    }
    else {
        console.log("[agent] provider=stub");
    }
}
/** Add run/agent options from flags to env (used by planner/config) */
function applyAgentRunEnvFromFlags(flags) {
    if (typeof flags.headed !== "undefined")
        process.env.HYPERTEST_RUN_HEADED = String(Boolean(flags.headed));
    if (typeof flags.trace === "string")
        process.env.HYPERTEST_RUN_TRACE = String(flags.trace);
    if (typeof flags["base-url"] === "string")
        process.env.HYPERTEST_BASE_URL = String(flags["base-url"]);
    if (typeof flags.reporter === "string")
        process.env.HYPERTEST_RUN_REPORTER = String(flags.reporter);
    // --mobile (boolean or device name/string). CLI also supports explicit --device.
    if (typeof flags.mobile !== "undefined" && !flags.device) {
        process.env.HYPERTEST_DEVICE = flags.mobile === true ? "Pixel 5" : String(flags.mobile);
    }
    if (typeof flags.device === "string") {
        process.env.HYPERTEST_DEVICE = String(flags.device);
    }
}
function findLatestRunDir(artifactsRoot = "artifacts") {
    const root = path.resolve(process.cwd(), artifactsRoot);
    if (!fs.existsSync(root))
        return null;
    const entries = fs.readdirSync(root).filter((d) => d.startsWith("run-"));
    if (entries.length === 0)
        return null;
    const withTimes = entries
        .map((d) => {
        const full = path.join(root, d);
        let mtime = 0;
        try {
            mtime = fs.statSync(full).mtimeMs;
        }
        catch { }
        return { d, full, mtime };
    })
        .sort((a, b) => b.mtime - a.mtime);
    return withTimes[0]?.full ?? null;
}
/** Spawn Playwright (`npx playwright test`) with optional flags */
function runPlaywrightOn(filePath, opts = {}) {
    const args = ["playwright", "test"];
    if (opts.config)
        args.push(`--config=${opts.config}`);
    args.push(filePath);
    if (opts.headed)
        args.push("--headed");
    if (opts.ui)
        args.push("--ui");
    if (opts.trace)
        args.push(`--trace=${opts.trace}`);
    if (opts.reporter)
        args.push(`--reporter=${opts.reporter}`);
    const env = { ...process.env };
    if (opts.baseURL)
        env.BASE_URL = opts.baseURL; // picked up in config
    if (opts.device)
        env.HYPERTEST_DEVICE = opts.device;
    const child = spawn("npx", args, { stdio: "inherit", shell: true, env });
    child.on("exit", (code) => process.exit(code ?? 0));
}
function promoteLatest(destPath = "tests/generated.spec.ts") {
    const latest = findLatestRunDir("artifacts");
    if (!latest)
        throw new Error('No artifacts found under ./artifacts. Generate a test first with: hypertest agent "<goal>"');
    const src = path.join(latest, "generated.spec.ts");
    if (!fs.existsSync(src))
        throw new Error(`No generated.spec.ts in ${latest}.`);
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(src, destPath);
    console.log(`[cli] Promoted latest spec:\n  from: ${src}\n    to: ${destPath}`);
}
/** Make a tiny verify spec inside artifacts so root config picks it up */
function writeVerifySpec() {
    const dir = stampedDir("artifacts", "verify");
    const out = path.join(dir, "verify.spec.ts");
    const baseUrl = process.env.HYPERTEST_BASE_URL || process.env.BASE_URL || "https://example.com";
    const content = `import { test, expect } from '@playwright/test';
test('hypertest verify: smoke', async ({ page }) => {
  await page.goto(process.env.BASE_URL || '${baseUrl}');
  await expect(page).toHaveTitle(/example/i);
});`;
    fs.writeFileSync(out, content, "utf8");
    return out;
}
function openFileCrossPlatform(filePath) {
    const platform = process.platform;
    const cmd = platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
    spawn(cmd, [filePath], { stdio: "ignore", shell: true });
}
function findLatestReportDir(root = "playwright-report") {
    const abs = path.resolve(process.cwd(), root);
    if (!fs.existsSync(abs))
        return null;
    const indexHere = path.join(abs, "index.html");
    if (fs.existsSync(indexHere))
        return abs;
    const subdirs = fs.readdirSync(abs).map((d) => path.join(abs, d)).filter((p) => {
        try {
            return fs.statSync(p).isDirectory();
        }
        catch {
            return false;
        }
    });
    if (!subdirs.length)
        return abs;
    const latest = subdirs
        .map((full) => ({ full, mtime: fs.statSync(full).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)[0]?.full;
    return latest ?? abs;
}
async function main() {
    const [, , cmd, ...rest] = process.argv;
    switch (cmd) {
        case "agent": {
            const flags = parseFlags(rest);
            const prompt = rest.filter((s) => !s.startsWith("--")).join(" ").trim()
                || "Create a basic smoke test for https://example.com (login + happy path).";
            applyProviderEnv(flags);
            echoProviderBanner();
            applyAgentRunEnvFromFlags(flags);
            const results = await runAgent({ prompt, target: "web" });
            console.log("[agent] results:");
            for (const r of results)
                console.log("-", r.message);
            saveArtifacts(results, typeof flags["artifacts-dir"] === "string" ? String(flags["artifacts-dir"]) : undefined);
            // NEW: optionally run immediately
            if (flags["and-run"]) {
                const latest = findLatestRunDir("artifacts");
                if (!latest) {
                    console.error("[cli] No artifacts after agent run.");
                    process.exit(1);
                }
                const specAbs = path.join(latest, "generated.spec.ts");
                const relToArtifacts = path.relative(path.resolve(process.cwd(), "artifacts"), specAbs) || "generated.spec.ts";
                console.log(`[cli] Running newest spec (artifacts config): ${relToArtifacts}`);
                const device = (typeof flags.device === "string" && flags.device) ||
                    (typeof flags.mobile !== "undefined" ? (flags.mobile === true ? "Pixel 5" : String(flags.mobile)) : process.env.HYPERTEST_DEVICE);
                runPlaywrightOn(relToArtifacts, {
                    config: "playwright.artifacts.config.ts",
                    headed: Boolean(flags.headed),
                    ui: Boolean(flags.ui),
                    trace: typeof flags.trace === "string" ? String(flags.trace) : undefined,
                    reporter: typeof flags.reporter === "string" ? String(flags.reporter) : undefined,
                    baseURL: typeof flags["base-url"] === "string" ? String(flags["base-url"]) : undefined,
                    device
                });
            }
            return;
        }
        case "record": {
            const flags = parseFlags(rest);
            const url = rest.find((s) => !s.startsWith("--")) || process.env.BASE_URL || "https://example.com";
            // map --mobile to a device name for codegen if device not given
            if (typeof flags.mobile !== "undefined" && !flags.device) {
                flags.device = (flags.mobile === true ? "Pixel 5" : String(flags.mobile));
            }
            const recDir = stampedDir("artifacts", "rec");
            let targetArg = "playwright-test-ts";
            if (typeof flags.target === "string") {
                const t = flags.target.toLowerCase();
                targetArg = t === "ts" ? "playwright-test-ts" : t === "js" ? "playwright-test" : t;
            }
            const outFile = path.join(recDir, targetArg.includes("ts") ? "recorded.spec.ts" : "recorded.spec.js");
            const args = ["playwright", "codegen", url, `--target=${targetArg}`, `--output=${outFile}`];
            if (typeof flags.browser === "string") {
                const b = String(flags.browser).toLowerCase();
                if (b === "chromium" || b === "firefox" || b === "webkit")
                    args.push(`--browser=${b}`);
            }
            if (typeof flags.device === "string")
                args.push(`--device=${String(flags.device)}`);
            if (typeof flags.viewport === "string") {
                const v = String(flags.viewport).replace("x", ",");
                args.push(`--viewport-size=${v}`);
            }
            if (typeof flags["base-url"] === "string")
                process.env.BASE_URL = String(flags["base-url"]);
            console.log(`[cli] Launching Playwright Recorder…`);
            console.log(`[cli] Output will be saved to: ${outFile}`);
            const child = spawn("npx", args, { stdio: "inherit", shell: true, env: { ...process.env } });
            child.on("exit", (code) => {
                if (code === 0 && fs.existsSync(outFile)) {
                    console.log(`[cli] Recording saved → ${outFile}`);
                    if (flags.promote) {
                        const dest = "tests/generated.spec.ts";
                        ensureDir(path.dirname(dest));
                        fs.copyFileSync(outFile, dest);
                        console.log(`[cli] Promoted recording to ${dest}`);
                    }
                }
                else {
                    console.error(`[cli] Recorder exited with code ${code ?? 1}.`);
                    process.exit(1);
                }
            });
            return;
        }
        case "run-latest": {
            const flags = parseFlags(rest);
            const latest = findLatestRunDir("artifacts");
            if (!latest) {
                console.error('[cli] No artifacts found under ./artifacts. Generate a test first with: hypertest agent "<goal>"');
                process.exit(1);
            }
            const specAbs = path.join(latest, "generated.spec.ts");
            if (!fs.existsSync(specAbs)) {
                console.error(`[cli] No generated.spec.ts in ${latest}.`);
                process.exit(1);
            }
            const relToArtifacts = path.relative(path.resolve(process.cwd(), "artifacts"), specAbs) || "generated.spec.ts";
            console.log(`[cli] Running latest spec (artifacts config): ${relToArtifacts}`);
            const device = (typeof flags.device === "string" && flags.device) ||
                (typeof flags.mobile !== "undefined" ? (flags.mobile === true ? "Pixel 5" : String(flags.mobile)) : process.env.HYPERTEST_DEVICE);
            runPlaywrightOn(relToArtifacts, {
                config: "playwright.artifacts.config.ts",
                headed: Boolean(flags.headed),
                ui: Boolean(flags.ui),
                trace: typeof flags.trace === "string" ? String(flags.trace) : undefined,
                reporter: typeof flags.reporter === "string" ? String(flags.reporter) : undefined,
                baseURL: typeof flags["base-url"] === "string" ? String(flags["base-url"]) : undefined,
                device
            });
            return;
        }
        case "promote-latest": {
            const flags = parseFlags(rest);
            const dest = (typeof flags.dest === "string" ? String(flags.dest) : undefined) || "tests/generated.spec.ts";
            try {
                promoteLatest(dest);
                if (flags.run) {
                    const device = (typeof flags.device === "string" && flags.device) ||
                        (typeof flags.mobile !== "undefined" ? (flags.mobile === true ? "Pixel 5" : String(flags.mobile)) : process.env.HYPERTEST_DEVICE);
                    runPlaywrightOn(dest, {
                        headed: Boolean(flags.headed),
                        ui: Boolean(flags.ui),
                        trace: typeof flags.trace === "string" ? String(flags.trace) : undefined,
                        reporter: typeof flags.reporter === "string" ? String(flags.reporter) : undefined,
                        baseURL: typeof flags["base-url"] === "string" ? String(flags["base-url"]) : undefined,
                        device
                    });
                }
            }
            catch (e) {
                console.error("[cli]", e?.message || e);
                process.exit(1);
            }
            return;
        }
        case "open-report": {
            const reportDir = findLatestReportDir("playwright-report");
            if (!reportDir) {
                console.error("[cli] No playwright-report/ directory found. Run with --reporter=html first.");
                process.exit(1);
            }
            const indexFile = path.join(reportDir, "index.html");
            if (!fs.existsSync(indexFile)) {
                console.error(`[cli] Could not find ${indexFile}. Did the HTML reporter run?`);
                process.exit(1);
            }
            console.log(`[cli] Opening ${indexFile}`);
            openFileCrossPlatform(indexFile);
            return;
        }
        case "verify": {
            // Lint -> Build -> Tiny spec run (headless, list reporter)
            parseFlags(rest);
            const runStep = (cmd, args) => new Promise((resolve, reject) => {
                const child = spawn(cmd, args, { stdio: "inherit", shell: true });
                child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} -> ${code}`))));
            });
            try {
                await runStep("pnpm", ["lint"]);
                await runStep("pnpm", ["-r", "build"]);
                const spec = writeVerifySpec();
                console.log(`[cli] Verify spec: ${spec}`);
                runPlaywrightOn(path.relative(path.resolve(process.cwd(), "artifacts"), spec), {
                    config: "playwright.artifacts.config.ts",
                    headed: false,
                    reporter: "list"
                });
            }
            catch (e) {
                console.error("[cli] verify failed:", e?.message || e);
                process.exit(1);
            }
            return;
        }
        case "smoke": {
            const flags = parseFlags(rest);
            const goal = rest.filter((s) => !s.startsWith("--")).join(" ").trim()
                || "Create a basic smoke test for https://example.com (login + happy path).";
            applyProviderEnv(flags);
            echoProviderBanner();
            applyAgentRunEnvFromFlags(flags);
            const results = await runAgent({ prompt: goal, target: "web" });
            console.log("[agent] results:");
            for (const r of results)
                console.log("-", r.message);
            saveArtifacts(results);
            const latest = findLatestRunDir("artifacts");
            if (!latest) {
                console.error("[cli] No artifacts after agent run.");
                process.exit(1);
            }
            const specAbs = path.join(latest, "generated.spec.ts");
            const relToArtifacts = path.relative(path.resolve(process.cwd(), "artifacts"), specAbs) || "generated.spec.ts";
            console.log(`[cli] Running newest spec (artifacts config): ${relToArtifacts}`);
            const device = (typeof flags.device === "string" && flags.device) ||
                (typeof flags.mobile !== "undefined" ? (flags.mobile === true ? "Pixel 5" : String(flags.mobile)) : process.env.HYPERTEST_DEVICE);
            runPlaywrightOn(relToArtifacts, {
                config: "playwright.artifacts.config.ts",
                headed: Boolean(flags.headed),
                ui: Boolean(flags.ui),
                trace: typeof flags.trace === "string" ? String(flags.trace) : undefined,
                reporter: typeof flags.reporter === "string" ? String(flags.reporter) : undefined,
                baseURL: typeof flags["base-url"] === "string" ? String(flags["base-url"]) : undefined,
                device
            });
            return;
        }
        case "help":
        case "-h":
        case "--help": {
            const help = `
HyperTest CLI

Usage:
  hypertest                          Run default orchestrator (stub)
  hypertest agent "<goal>"           Plan -> record/script using the Agent (use --and-run to execute)
  hypertest record <url>             Launch Playwright Recorder and save to artifacts/rec-*/recorded.spec.(ts|js)
  hypertest run-latest               Run the newest generated Playwright spec (from artifacts)
  hypertest promote-latest           Copy newest generated spec to tests/generated.spec.ts (or --dest)
  hypertest open-report              Open the latest Playwright HTML report
  hypertest verify                   Lint -> build -> run a tiny smoke spec (headless)
  hypertest smoke "<goal>"           One-shot: Agent -> run latest (artifacts)

Agent Extras:
  --and-run                          after generating, immediately run latest spec

Record Flags:
  --target <ts|js|raw>               output target (default: ts -> playwright-test-ts)
  --browser <chromium|firefox|webkit>
  --device <name>                    e.g., "Desktop Chrome" / "Pixel 5"
  --viewport <WxH>                   e.g., 1280x800
  --base-url <url>                   optional BASE_URL env for codegen
  --promote                          copy recorded file to tests/generated.spec.ts

Common Flags:
  --base-url <url>                   Pass BASE_URL to Playwright (config picks it up)
  --mobile[=<device>]                Emulate a mobile device (default if no value: "Pixel 5")
  --device "<Playwright device>"     Explicit device, e.g., "iPhone 14"

Provider Flags (agent):
  --provider <stub|openai|ollama|lmstudio>
  --model <name>                     (openai) default: gpt-4o-mini
  --key <api_key>                    (openai) or OPENAI_API_KEY
  --ollama-model <name>              (ollama) default: llama3.2
  --ollama-base <url>                (ollama) default: http://localhost:11434
  --lmstudio-base <url>              (lmstudio) e.g., http://localhost:1234
  --lmstudio-model <name>            (lmstudio) optional

Run Flags (smoke / run-latest / and-run):
  --headed                           headed mode
  --ui                               Playwright UI mode
  --trace <on|off|retain-on-failure> tracing
  --reporter <list|html|dot|...>     reporter
  --mobile[=<device>]                device emulation shortcut
  --device "<Playwright device>"     explicit device
`;
            console.log(help.trimEnd());
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
