import { execute } from "./executor.js";
import { plan } from "./planner.js";
import { getLLMFromEnv } from "./providers/index.js";
export async function runAgent(goal, llm) {
    const driver = llm ?? getLLMFromEnv();
    const p = await plan(driver, goal);
    const results = await execute(p);
    return results;
}
