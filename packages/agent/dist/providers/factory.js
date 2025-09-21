import { readEnv } from "../config.js";
import { StubLLM } from "./llm.js";
import { LMStudioLLM } from "./lmstudio.js";
import { OllamaLLM } from "./ollama.js";
import { OpenAILLM } from "./openai.js";
export function getLLMFromEnv(overrides) {
    const env = readEnv();
    const provider = (overrides?.provider ?? env.provider);
    if (provider === "openai") {
        const apiKey = overrides?.openaiApiKey ?? env.openaiApiKey;
        const model = overrides?.openaiModel ?? env.openaiModel ?? "gpt-4o-mini";
        if (!apiKey)
            return new StubLLM();
        return new OpenAILLM({ apiKey, model });
    }
    if (provider === "ollama") {
        const baseUrl = overrides?.ollamaBaseUrl ?? env.ollamaBaseUrl;
        const model = overrides?.ollamaModel ?? env.ollamaModel ?? "llama3.2";
        return new OllamaLLM({ baseUrl, model });
    }
    if (provider === "lmstudio") {
        const baseUrl = (overrides?.lmstudioBaseUrl ?? env.lmstudioBaseUrl) ?? "http://localhost:1234";
        const model = overrides?.lmstudioModel ?? env.lmstudioModel;
        return new LMStudioLLM({ baseUrl, model });
    }
    return new StubLLM();
}
