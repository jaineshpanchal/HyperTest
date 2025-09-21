import { Page, Locator } from "@playwright/test";
/**
 * Heuristic: prefer role/name, then label/placeholder, then data-testid,
 * then id/name attributes, finally fallback CSS.
 */
export declare function byStable(page: Page, hint: string): Locator;
/** convenience wrappers */
export declare const sel: {
    stable: typeof byStable;
};
//# sourceMappingURL=selectors.d.ts.map