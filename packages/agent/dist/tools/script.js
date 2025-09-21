export async function toolScript(_) {
    const script = `export async function test_login() { console.log("test stub"); }`;
    return {
        ok: true,
        message: "Script generated (stub).",
        artifacts: { script: "artifacts/scripts/test_login.ts", content: script }
    };
}
