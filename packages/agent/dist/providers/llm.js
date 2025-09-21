export class StubLLM {
    async generate(input) {
        return `# Plan
- record
- script
- run

# Notes
(${input.slice(0, 120)}...)`;
    }
}
