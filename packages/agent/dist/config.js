export function readEnv() {
    const provider = (process.env.HYPERTEST_PROVIDER ?? "stub").toLowerCase();
    return {
        provider: provider,
        // openai
        openaiApiKey: process.env.OPENAI_API_KEY,
        openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        // ollama
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL, // if unset, provider default is used
        ollamaModel: process.env.OLLAMA_MODEL ?? "llama3.2",
        // lmstudio
        lmstudioBaseUrl: process.env.LMSTUDIO_BASE_URL, // e.g., http://localhost:1234
        lmstudioModel: process.env.LMSTUDIO_MODEL
    };
}
