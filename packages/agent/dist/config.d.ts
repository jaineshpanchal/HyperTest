export type ProviderName = "stub" | "openai" | "ollama" | "lmstudio";
export type AgentEnv = {
    provider: ProviderName;
    openaiApiKey?: string;
    openaiModel?: string;
    ollamaBaseUrl?: string;
    ollamaModel?: string;
    lmstudioBaseUrl?: string;
    lmstudioModel?: string;
};
export declare function readEnv(): AgentEnv;
//# sourceMappingURL=config.d.ts.map