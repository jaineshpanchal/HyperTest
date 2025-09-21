export class OpenAILLM {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    async generate(input) {
        const messages = [
            { role: "system", content: "You are a test automation planner. Return concise steps." },
            { role: "user", content: input }
        ];
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.opts.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: this.opts.model,
                messages,
                temperature: 0.2
            })
        });
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`OpenAI API error ${res.status}: ${text}`);
        }
        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content ?? "";
        return String(content);
    }
}
