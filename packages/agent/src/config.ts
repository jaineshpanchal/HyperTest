export type ProviderName = "stub" | "openai";

export type AgentEnv = {
  provider: ProviderName;
  openaiApiKey?: string;
  openaiModel?: string;
};

export function readEnv(): AgentEnv {
  const provider = (process.env.HYPERTEST_PROVIDER ?? "stub").toLowerCase() as ProviderName;
  return {
    provider: provider === "openai" ? "openai" : "stub",
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
  };
}
