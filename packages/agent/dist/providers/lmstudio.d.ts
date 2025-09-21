import type { LLM } from "./llm.js";
/**
 * LM Studio exposes OpenAI-compatible endpoints locally, e.g.:
 *   POST {baseUrl}/v1/chat/completions
 * Docs: https://lmstudio.ai/docs/app/api/endpoints/openai
 */
export declare class LMStudioLLM implements LLM {
    private opts;
    constructor(opts: {
        baseUrl: string;
        model?: string;
    });
    generate(input: string): Promise<string>;
}
//# sourceMappingURL=lmstudio.d.ts.map