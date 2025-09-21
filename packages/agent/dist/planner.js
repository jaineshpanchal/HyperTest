export async function plan(llm, goal) {
    const rationale = await llm.generate(`Create a step-by-step test plan for: ${goal.prompt}. Target: ${goal.target ?? "web"}.`);
    const steps = [
        { kind: "record" },
        { kind: "script", language: "ts" },
        { kind: "advise-selectors" },
        { kind: "run" },
    ];
    return { steps, rationale };
}
