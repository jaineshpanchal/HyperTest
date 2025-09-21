import type { AgentResult } from "./types.js";
export type ToolLike = (input: any) => Promise<AgentResult>;
export type ToolRegistry = Record<string, ToolLike>;
/**
 * Register all agent tools here.
 * - "script": emits a Playwright spec using sel.stable(...) helpers
 * - "run": executes the newest generated spec via Playwright
 */
export declare function makeRegistry(): ToolRegistry;
//# sourceMappingURL=registry.d.ts.map