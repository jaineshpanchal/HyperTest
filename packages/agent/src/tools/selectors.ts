import type { AgentResult } from "../types.js";

export async function toolAdviseSelectors(): Promise<AgentResult> {
  const tips = [
    "Prefer getByRole/name or aria-* before CSS/XPath.",
    "Use data-testid only when semantics are missing.",
    "Avoid dynamic classes or generated IDs.",
  ].join("\n");
  return { ok: true, message: "Selector advice (stub).", artifacts: { tips } };
}
