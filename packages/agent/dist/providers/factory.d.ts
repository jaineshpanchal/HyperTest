import type { LLM } from "./llm.js";
export declare function getLLMFromEnv(overrides?: {
    provider?: "stub" | "openai" | "ollama" | "lmstudio";
    openaiApiKey?: string;
    openaiModel?: string;
    ollamaBaseUrl?: string;
    ollamaModel?: string;
    lmstudioBaseUrl?: string;
    lmstudioModel?: string;
}): LLM;
//# sourceMappingURL=factory.d.ts.map