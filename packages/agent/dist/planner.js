/**
 * Minimal planner:
 *  - Only generate a Playwright script (TypeScript).
 *  - Running is done by the CLI (`hypertest smoke` or `hypertest run-latest`).
 */
export async function plan(_llm, input) {
    const plan = {
        steps: [
            // `suite` and `goal` are carried through to the script tool
            { kind: "script", suite: "HyperTest generated: smoke", goal: input.prompt, language: "ts" }
        ]
    };
    return plan;
}
