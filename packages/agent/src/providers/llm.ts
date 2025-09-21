export interface LLM {
  generate(input: string): Promise<string>;
}

export class StubLLM implements LLM {
  async generate(input: string): Promise<string> {
    return `# Plan
- record
- script
- run

# Notes
(${input.slice(0, 120)}...)`;
  }
}
