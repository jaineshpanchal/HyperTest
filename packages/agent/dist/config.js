export function readEnv() {
    const provider = (process.env.HYPERTEST_PROVIDER ?? "stub").toLowerCase();
    return {
        provider: provider === "openai" ? "openai" : "stub",
        openaiApiKey: process.env.OPENAI_API_KEY,
        openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    };
}
