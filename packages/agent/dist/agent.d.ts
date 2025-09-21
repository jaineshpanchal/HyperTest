import type { LLM } from "./providers/index.js";
import type { AgentResult } from "./types.js";
export type AgentInput = {
    prompt: string;
    target?: "web" | "api";
};
/**
 * Run the HyperTest Agent:
 *  1) Choose LLM provider from env (or injected)
 *  2) Build a plan from the prompt/target
 *  3) Execute the plan and return step results
 *  4) If the primary provider fails, fall back to a StubLLM to keep the flow usable
 */
export declare function runAgent(input: AgentInput, llm?: LLM): Promise<AgentResult[]>;
//# sourceMappingURL=agent.d.ts.map