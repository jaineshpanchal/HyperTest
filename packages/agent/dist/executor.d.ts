import type { AgentPlan, AgentResult } from "./types.js";
/**
 * Execute an AgentPlan by invoking tools in order.
 * Unknown tools produce a soft-fail result so the pipeline keeps going.
 */
export declare function executePlan(plan: AgentPlan): Promise<AgentResult[]>;
//# sourceMappingURL=executor.d.ts.map