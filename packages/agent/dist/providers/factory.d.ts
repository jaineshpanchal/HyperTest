import type { LLM } from "./llm.js";
export declare function getLLMFromEnv(overrides?: {
    provider?: "stub" | "openai";
    openaiApiKey?: string;
    openaiModel?: string;
}): LLM;
//# sourceMappingURL=factory.d.ts.map