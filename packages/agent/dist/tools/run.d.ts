import type { AgentResult } from "../types.js";
type ToolLike = (input: {
    headed?: boolean;
    trace?: "on" | "off" | "retain-on-failure";
    reporter?: string;
    baseURL?: string;
    device?: string;
}) => Promise<AgentResult>;
export declare function runTool(): ToolLike;
export {};
//# sourceMappingURL=run.d.ts.map