import type { LLM } from "./llm.js";
export declare class OpenAILLM implements LLM {
    private opts;
    constructor(opts: {
        apiKey: string;
        model: string;
    });
    generate(input: string): Promise<string>;
}
//# sourceMappingURL=openai.d.ts.map