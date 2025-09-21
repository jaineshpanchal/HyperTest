import { runner as webRunner } from "@hypertest/runner-web";
export async function toolRun(_) {
    webRunner.init();
    return {
        ok: true,
        message: "Executed suite (stub).",
        artifacts: { report: "artifacts/reports/last.json" }
    };
}
