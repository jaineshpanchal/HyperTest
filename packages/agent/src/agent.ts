import { execute } from "./executor.js";
import { plan } from "./planner.js";
import { getLLMFromEnv } from "./providers/index.js";
import type { LLM } from "./providers/index.js";
import { StubLLM } from "./providers/llm.js";
import type { AgentGoal, AgentResult } from "./types.js";

export async function runAgent(goal: AgentGoal, llm?: LLM): Promise<AgentResult[]> {
  const driver = llm ?? getLLMFromEnv();
  try {
    const p = await plan(driver, goal);
    return await execute(p);
  } catch (err: any) {
    console.warn("[agent] provider error:", err?.message ?? err);
    console.warn("[agent] falling back to stub provider.");
    const p2 = await plan(new StubLLM(), goal);
    return await execute(p2);
  }
}
