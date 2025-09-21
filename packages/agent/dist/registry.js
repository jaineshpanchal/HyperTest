// packages/agent/src/registry.ts
import { runTool } from "./tools/run.js";
import { scriptTool } from "./tools/script.js";
/**
 * Register all agent tools here.
 * - "script": emits a Playwright spec using sel.stable(...) helpers
 * - "run": executes the newest generated spec via Playwright
 */
export function makeRegistry() {
    return {
        script: scriptTool(),
        run: runTool(),
        // future:
        // record: recordTool(),
        // selectors: selectorsAuditTool(),
    };
}
