/**
 * Heuristic: prefer role/name, then label/placeholder, then data-testid,
 * then id/name attributes, finally fallback CSS.
 */
export function byStable(page, hint) {
    // 1) role=<role> name="<text>"
    const m = hint.match(/role=(\w+)\s+name=["'](.+?)["']/i);
    if (m) {
        const role = m[1];
        const name = m[2];
        return page.getByRole(role, { name });
    }
    // 2) label or placeholder
    if (hint.startsWith("label=")) {
        const text = hint.slice("label=".length);
        return page.getByLabel(text);
    }
    if (hint.startsWith("placeholder=")) {
        const text = hint.slice("placeholder=".length);
        return page.getByPlaceholder(text);
    }
    // 3) data-testid, common patterns
    if (hint.startsWith("testid=")) {
        const id = hint.slice("testid=".length);
        return page.locator(`[data-testid="${id}"]`);
    }
    if (hint.startsWith("testId=")) {
        const id = hint.slice("testId=".length);
        return page.locator(`[data-test-id="${id}"], [data-testid="${id}"]`);
    }
    // 4) id or name attribute
    if (hint.startsWith("#")) {
        return page.locator(hint); // raw CSS id
    }
    if (hint.startsWith("name=")) {
        const n = hint.slice("name=".length);
        return page.locator(`[name="${n}"]`);
    }
    // 5) fallback: treat as CSS or text
    if (hint.startsWith("css=")) {
        return page.locator(hint.slice("css=".length));
    }
    // If it's short and looks like link/button text, try role+name
    if (/^[\w\s./-]{1,60}$/.test(hint)) {
        return page.getByRole("link", { name: hint }).or(page.getByRole("button", { name: hint }));
    }
    return page.locator(hint);
}
/** convenience wrappers */
export const sel = {
    stable: byStable
};
