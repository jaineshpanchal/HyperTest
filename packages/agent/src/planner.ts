import type { LLM } from "./providers/index.js";
import type { AgentGoal, AgentPlan, PlanStep } from "./types.js";

export async function plan(llm: LLM, goal: AgentGoal): Promise<AgentPlan> {
  const rationale = await llm.generate(
    `Create a step-by-step test plan for: ${goal.prompt}. Target: ${goal.target ?? "web"}.`
  );
  const steps: PlanStep[] = [
    { kind: "record" },
    { kind: "script", language: "ts" },
    { kind: "advise-selectors" },
    { kind: "run" },
  ];
  return { steps, rationale };
}
