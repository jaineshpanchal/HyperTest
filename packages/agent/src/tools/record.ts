import type { AgentResult } from "../types.js";

export async function toolRecord(opts?: { url?: string }): Promise<AgentResult> {
  return {
    ok: true,
    message: `Recorded steps${opts?.url ? " at " + opts.url : ""} (stub).`,
    artifacts: { recording: "artifacts/recordings/session-0001.json" },
  };
}
