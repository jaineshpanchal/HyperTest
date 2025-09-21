/**
 * Minimal Ollama client: POST /api/generate
 * Docs: https://docs.ollama.com/api  (local default: http://localhost:11434/api/generate)
 */
export class OllamaLLM {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    async generate(input) {
        const url = `${this.opts.baseUrl ?? "http://localhost:11434"}/api/generate`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.opts.model,
                prompt: input,
                stream: false
            })
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Ollama request failed: HTTP ${res.status}\n${text}`);
        }
        const json = await res.json().catch(() => ({}));
        // Ollama returns { response: "..." , ... }
        return String(json?.response ?? "");
    }
}
