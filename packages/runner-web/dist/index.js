// packages/runner-web/src/index.ts
export const runner = {
    name: "web",
    init() {
        console.log("[runner-web] bootstrap");
    },
};
// Re-export public helpers (resilient selector utilities, etc.)
export * from "./selectors.js";
