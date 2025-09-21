// packages/agent/src/registry.ts
import { runTool } from "./tools/run.js";
import { scriptTool } from "./tools/script.js";
import type { AgentResult } from "./types.js";

// Callable signature each tool implements
export type ToolLike = (input: any) => Promise<AgentResult>;
export type ToolRegistry = Record<string, ToolLike>;

/**
 * Register all agent tools here.
 * - "script": emits a Playwright spec using sel.stable(...) helpers
 * - "run": executes the newest generated spec via Playwright
 */
export function makeRegistry(): ToolRegistry {
  return {
    script: scriptTool(),
    run: runTool(),
    // future:
    // record: recordTool(),
    // selectors: selectorsAuditTool(),
  };
}
