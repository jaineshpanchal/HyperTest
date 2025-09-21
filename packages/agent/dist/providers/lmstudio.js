/**
 * LM Studio exposes OpenAI-compatible endpoints locally, e.g.:
 *   POST {baseUrl}/v1/chat/completions
 * Docs: https://lmstudio.ai/docs/app/api/endpoints/openai
 */
export class LMStudioLLM {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    async generate(input) {
        const url = `${this.opts.baseUrl.replace(/\/+$/, "")}/v1/chat/completions`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.opts.model ?? "default",
                messages: [
                    { role: "system", content: "You are a test automation planner. Return concise steps." },
                    { role: "user", content: input }
                ],
                temperature: 0.2
            })
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`LM Studio (OpenAI-compat) failed: HTTP ${res.status}\n${text}`);
        }
        const json = await res.json().catch(() => ({}));
        return String(json?.choices?.[0]?.message?.content ?? "");
    }
}
