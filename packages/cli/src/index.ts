#!/usr/bin/env node
import { runAgent } from "@hypertest/agent";
import { run } from "@hypertest/orchestrator";

async function main() {
  const [, , cmd, ...rest] = process.argv;

  switch (cmd) {
    case "agent": {
      const prompt =
        rest.join(" ").trim() ||
        "Create a basic smoke test for https://example.com (login + happy path).";
      const results = await runAgent({ prompt, target: "web" });
      console.log("[agent] results:");
      for (const r of results) console.log("-", r.message);
      return;
    }

    case "help":
    case "-h":
    case "--help": {
      console.log(`HyperTest CLI

Usage:
  hypertest                   Run default orchestrator (stub)
  hypertest agent "<goal>"    Plan → record/script → run using the Agent
  hypertest help              Show this help
`);
      return;
    }

    default: {
      run();
      return;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
