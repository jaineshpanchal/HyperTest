// packages/agent/src/planner.ts
import type { LLM } from "./providers/index.js";
import type { AgentPlan } from "./types.js";

/**
 * Minimal planner:
 *  - Only generate a Playwright script (TypeScript).
 *  - Running is done by the CLI (`hypertest smoke` or `hypertest run-latest`).
 */
export async function plan(
  _llm: LLM,
  input: { prompt: string; target?: "web" | "api" }
): Promise<AgentPlan> {
  const plan: AgentPlan = {
    steps: [
      // `suite` and `goal` are carried through to the script tool
      { kind: "script", suite: "HyperTest generated: smoke", goal: input.prompt, language: "ts" } as any
    ]
  };
  return plan;
}
