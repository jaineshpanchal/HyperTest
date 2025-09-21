import { readEnv } from "../config.js";
import { StubLLM } from "./llm.js";
import { OpenAILLM } from "./openai.js";
export function getLLMFromEnv(overrides) {
    const env = readEnv();
    const provider = overrides?.provider ?? env.provider;
    if (provider === "openai") {
        const apiKey = overrides?.openaiApiKey ?? env.openaiApiKey;
        const model = overrides?.openaiModel ?? env.openaiModel ?? "gpt-4o-mini";
        if (!apiKey) {
            console.warn("[agent] OPENAI selected but OPENAI_API_KEY is missing — falling back to stub.");
            return new StubLLM();
        }
        return new OpenAILLM({ apiKey, model });
    }
    return new StubLLM();
}
