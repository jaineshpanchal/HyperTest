import { plan } from "./planner.js";
import { execute } from "./executor.js";
import { StubLLM } from "./providers/index.js";
export async function runAgent(goal, llm) {
    const driver = llm ?? new StubLLM();
    const p = await plan(driver, goal);
    const results = await execute(p);
    return results;
}
