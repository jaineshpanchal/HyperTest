export type AgentGoal = {
  prompt: string;
  target?: "web" | "mobile" | "api";
  env?: Record<string, string>;
};

export type PlanStep =
  | { kind: "record"; url?: string }
  | { kind: "script"; language?: "ts" | "py" }
  | { kind: "run"; suite?: string }
  | { kind: "advise-selectors" };

export type AgentPlan = {
  steps: PlanStep[];
  rationale?: string;
};

export type AgentResult = {
  ok: boolean;
  message: string;
  artifacts?: Record<string, string>;
};
