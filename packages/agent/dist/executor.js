// packages/agent/src/executor.ts
import { makeRegistry } from "./registry.js";
/**
 * Execute an AgentPlan by invoking tools in order.
 * Unknown tools produce a soft-fail result so the pipeline keeps going.
 */
export async function executePlan(plan) {
    const registry = makeRegistry();
    const results = [];
    for (const step of plan.steps) {
        const tool = registry[step.kind];
        if (!tool) {
            results.push({ ok: false, message: `Unknown tool: ${step.kind}` });
            continue;
        }
        // Build the input from the step itself. If a planner later adds fields like "goal",
        // they will flow through automatically via spread.
        const input = { ...step };
        try {
            const res = await tool(input);
            results.push(res);
        }
        catch (err) {
            results.push({
                ok: false,
                message: `Tool ${step.kind} failed: ${err?.message ?? String(err)}`
            });
        }
    }
    return results;
}
