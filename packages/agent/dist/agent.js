// packages/agent/src/agent.ts
import { executePlan } from "./executor.js";
import { plan } from "./planner.js";
import { getLLMFromEnv } from "./providers/index.js";
import { StubLLM } from "./providers/llm.js";
/**
 * Run the HyperTest Agent:
 *  1) Choose LLM provider from env (or injected)
 *  2) Build a plan from the prompt/target
 *  3) Execute the plan and return step results
 *  4) If the primary provider fails, fall back to a StubLLM to keep the flow usable
 */
export async function runAgent(input, llm) {
    const driver = llm ?? getLLMFromEnv();
    try {
        const p = await plan(driver, input);
        return await executePlan(p);
    }
    catch (err) {
        console.warn("[agent] provider error:", err?.message ?? String(err));
        console.warn("[agent] falling back to stub provider.");
        const p2 = await plan(new StubLLM(), input);
        return await executePlan(p2);
    }
}
