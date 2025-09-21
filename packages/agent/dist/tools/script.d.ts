import type { AgentResult } from "../types.js";
type ToolLike = (input: {
    goal?: string;
    suite?: string;
}) => Promise<AgentResult>;
export declare function scriptTool(): ToolLike;
export {};
//# sourceMappingURL=script.d.ts.map