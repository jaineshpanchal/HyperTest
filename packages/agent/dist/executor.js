import { ToolRegistry } from "./registry.js";
export async function execute(plan) {
    const results = [];
    for (const step of plan.steps) {
        switch (step.kind) {
            case "record":
                results.push(await ToolRegistry.record({ url: step.url }));
                break;
            case "script":
                results.push(await ToolRegistry.script({ language: step.language }));
                break;
            case "advise-selectors":
                results.push(await ToolRegistry["advise-selectors"]());
                break;
            case "run":
                results.push(await ToolRegistry.run({ suite: step.suite }));
                break;
        }
    }
    return results;
}
