import { runner as webRunner } from "@hypertest/runner-web";

import type { AgentResult } from "../types.js";

export async function toolRun(_: { suite?: string }): Promise<AgentResult> {
  webRunner.init();
  return {
    ok: true,
    message: "Executed suite (stub).",
    artifacts: { report: "artifacts/reports/last.json" },
  };
}
