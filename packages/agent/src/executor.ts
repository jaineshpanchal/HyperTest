import { ToolRegistry } from "./registry.js";
import type { AgentPlan, AgentResult } from "./types.js";

export async function execute(plan: AgentPlan): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  for (const step of plan.steps) {
    switch (step.kind) {
      case "record":
        results.push(await ToolRegistry.record({ url: step.url }));
        break;
      case "script":
        results.push(await ToolRegistry.script({ language: step.language }));
        break;
      case "advise-selectors":
        results.push(await ToolRegistry["advise-selectors"]());
        break;
      case "run":
        results.push(await ToolRegistry.run({ suite: step.suite }));
        break;
    }
  }
  return results;
}
