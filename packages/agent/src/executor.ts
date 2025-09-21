// packages/agent/src/executor.ts
import { makeRegistry } from "./registry.js";
import type { AgentPlan, AgentResult } from "./types.js";

// Keep the callable signature local to avoid import cycles
type ToolLike = (input: any) => Promise<AgentResult>;

/**
 * Execute an AgentPlan by invoking tools in order.
 * Unknown tools produce a soft-fail result so the pipeline keeps going.
 */
export async function executePlan(plan: AgentPlan): Promise<AgentResult[]> {
  const registry = makeRegistry();
  const results: AgentResult[] = [];

  for (const step of plan.steps) {
    const tool: ToolLike | undefined =
      registry[step.kind as keyof typeof registry] as ToolLike | undefined;

    if (!tool) {
      results.push({ ok: false, message: `Unknown tool: ${step.kind}` });
      continue;
    }

    // Build the input from the step itself. If a planner later adds fields like "goal",
    // they will flow through automatically via spread.
    const input = { ...(step as any) };

    try {
      const res = await tool(input);
      results.push(res);
    } catch (err: any) {
      results.push({
        ok: false,
        message: `Tool ${step.kind} failed: ${err?.message ?? String(err)}`
      });
    }
  }

  return results;
}
