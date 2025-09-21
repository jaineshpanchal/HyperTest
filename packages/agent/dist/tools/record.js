export async function toolRecord(opts) {
    return {
        ok: true,
        message: `Recorded steps${opts?.url ? " at " + opts.url : ""} (stub).`,
        artifacts: { recording: "artifacts/recordings/session-0001.json" }
    };
}
