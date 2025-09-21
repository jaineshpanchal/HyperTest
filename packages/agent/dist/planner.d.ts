import type { LLM } from "./providers/index.js";
import type { AgentPlan } from "./types.js";
/**
 * Minimal planner:
 *  - Only generate a Playwright script (TypeScript).
 *  - Running is done by the CLI (`hypertest smoke` or `hypertest run-latest`).
 */
export declare function plan(_llm: LLM, input: {
    prompt: string;
    target?: "web" | "api";
}): Promise<AgentPlan>;
//# sourceMappingURL=planner.d.ts.map