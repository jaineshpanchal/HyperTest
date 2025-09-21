export interface LLM {
    generate(input: string): Promise<string>;
}
export declare class StubLLM implements LLM {
    generate(input: string): Promise<string>;
}
//# sourceMappingURL=llm.d.ts.map