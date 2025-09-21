import { execute } from "./executor.js";
import { plan } from "./planner.js";
import { StubLLM } from "./providers/index.js";
import type { LLM } from "./providers/index.js";
import type { AgentGoal, AgentResult } from "./types.js";

export async function runAgent(goal: AgentGoal, llm?: LLM): Promise<AgentResult[]> {
  const driver = llm ?? new StubLLM();
  const p = await plan(driver, goal);
  const results = await execute(p);
  return results;
}
