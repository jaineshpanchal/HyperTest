export type ProviderName = "stub" | "openai";
export type AgentEnv = {
    provider: ProviderName;
    openaiApiKey?: string;
    openaiModel?: string;
};
export declare function readEnv(): AgentEnv;
//# sourceMappingURL=config.d.ts.map