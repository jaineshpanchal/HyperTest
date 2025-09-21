import type { LLM } from "./llm.js";
/**
 * Minimal Ollama client: POST /api/generate
 * Docs: https://docs.ollama.com/api  (local default: http://localhost:11434/api/generate)
 */
export declare class OllamaLLM implements LLM {
    private opts;
    constructor(opts: {
        baseUrl?: string;
        model: string;
    });
    generate(input: string): Promise<string>;
}
//# sourceMappingURL=ollama.d.ts.map