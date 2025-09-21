import type { LLM } from "./llm.js";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class OpenAILLM implements LLM {
  constructor(private opts: { apiKey: string; model: string }) {}

  async generate(input: string): Promise<string> {
    const messages: ChatMessage[] = [
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

    const json: any = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    return String(content);
  }
}
