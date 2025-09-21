// packages/agent/src/tools/run.ts
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
function findLatestRunDir(artifactsRoot = "artifacts") {
    const root = path.resolve(process.cwd(), artifactsRoot);
    if (!fs.existsSync(root))
        return null;
    const entries = fs.readdirSync(root).filter((d) => d.startsWith("run-"));
    if (!entries.length)
        return null;
    const latest = entries
        .map((d) => {
        const full = path.join(root, d);
        let mtime = 0;
        try {
            mtime = fs.statSync(full).mtimeMs;
        }
        catch { }
        return { full, mtime };
    })
        .sort((a, b) => b.mtime - a.mtime)[0]?.full;
    return latest ?? null;
}
export function runTool() {
    return async (opts = {}) => {
        const latest = findLatestRunDir("artifacts");
        if (!latest) {
            return { ok: false, message: "No artifacts found. Generate a test first with the script tool." };
        }
        const specAbs = path.join(latest, "generated.spec.ts");
        if (!fs.existsSync(specAbs)) {
            return { ok: false, message: `No generated.spec.ts in ${latest}.` };
        }
        const relToArtifacts = path.relative(path.resolve(process.cwd(), "artifacts"), specAbs) || "generated.spec.ts";
        const args = ["playwright", "test", `--config=playwright.artifacts.config.ts`, relToArtifacts];
        if (opts.headed)
            args.push("--headed");
        if (opts.trace)
            args.push(`--trace=${opts.trace}`);
        if (opts.reporter)
            args.push(`--reporter=${opts.reporter}`);
        const env = { ...process.env };
        if (opts.baseURL)
            env.BASE_URL = opts.baseURL;
        if (opts.device)
            env.HYPERTEST_DEVICE = opts.device; // NEW: used by playwright config
        const code = await new Promise((resolve) => {
            const child = spawn("npx", args, { stdio: "inherit", shell: true, env });
            child.on("exit", (c) => resolve(c ?? 1));
        });
        if (code === 0) {
            return { ok: true, message: "Playwright run passed." };
        }
        return { ok: false, message: `Playwright run failed with exit code ${code}.` };
    };
}
