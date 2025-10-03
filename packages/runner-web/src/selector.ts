import type { Page, Locator } from '@playwright/test';
import { Strategies } from '@hypertest/selector';
import type { SelectorPolicy, Target } from '@hypertest/selector';

export function selector(page: Page, policy?: SelectorPolicy) {
  return {
    by(target: Target | string): Locator {
      if (!target) throw new Error("selector.by() received an empty/undefined target" );
      if (typeof target === 'string') return Strategies.auto(page, target, policy);
      return Strategies.resolve(page, target, policy);
    }
  };
}
