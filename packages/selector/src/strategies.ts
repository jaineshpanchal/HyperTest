import type { Page, Locator } from '@playwright/test';
import type { Target, SelectorPolicy } from './types';

const defaultPolicy: Required<Pick<SelectorPolicy,'dataTestAttr'>> = { dataTestAttr: 'data-testid' };

function byDataTest(page: Page, value: string, policy?: SelectorPolicy): Locator {
  const attr = policy?.dataTestAttr ?? defaultPolicy.dataTestAttr;
  // Playwright has getByTestId only for data-testid; for custom attr use css
  if (attr === 'data-testid') return page.getByTestId(value);
  return page.locator(`[${attr}="${CSS.escape(value)}"]`);
}

function byRoleName(page: Page, role: string, name?: string | RegExp): Locator {
  return page.getByRole(role as any, name ? { name } : undefined);
}

function byLabel(page: Page, label: string): Locator {
  return page.getByLabel(label);
}

function byText(page: Page, text: string | RegExp): Locator {
  return typeof text === 'string' ? page.getByText(text, { exact: true }) : page.getByText(text);
}

function byCss(page: Page, css: string): Locator {
  return page.locator(css);
}

// minimal DOM anchor -> Locator chain. Expects a chain of css fragments relative to document.
function byDomAnchor(page: Page, chain: string[]): Locator {
  let loc = page.locator(chain[0]);
  for (let i = 1; i < chain.length; i++) loc = loc.locator(chain[i]);
  return loc;
}

export function resolve(page: Page, t: Target, policy?: SelectorPolicy): Locator {
  // explicit single-target resolution
  if ('dataTest' in t) return byDataTest(page, t.dataTest, policy);
  if ('role' in t)     return byRoleName(page, t.role, t.name);
  if ('label' in t)    return byLabel(page, t.label);
  if ('text' in t)     return byText(page, t.text);
  if ('css' in t)      return byCss(page, t.css);
  if ('domAnchor' in t)return byDomAnchor(page, t.domAnchor);
  throw new Error('Unknown target');
}

// Auto-resolve a plain string by policy preference order
export function auto(page: Page, plain: string, policy?: SelectorPolicy): Locator {
  const prefer = policy?.prefer ?? ['dataTest','roleName','labelProximity','text'];
  for (const s of prefer) {
    try {
      if (s === 'dataTest') return byDataTest(page, plain, policy);
      if (s === 'roleName') return byRoleName(page, 'button' as any, plain); // heuristic: try as button name
      if (s === 'labelProximity') return byLabel(page, plain);
      if (s === 'text') return byText(page, plain);
    } catch { /* ignore and continue */ }
  }
  // fallback
  return page.locator(`text=${plain}`);
}

// Simple DOM anchor generator for an elementHandle -> string[] chain.
// Note: keep simple; better generator can come later.
export async function computeDomAnchor(page: Page, selector: string): Promise<string[]> {
  const chain = await page.evaluate((sel) => {
    function piece(el: Element): string {
      if (!el) return '';
      if ((el as HTMLElement).id) return `${el.tagName.toLowerCase()}#${(el as HTMLElement).id}`;
      const cls = (el as HTMLElement).className?.toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
      if (cls) return `${el.tagName.toLowerCase()}.${cls}`;
      return el.tagName.toLowerCase();
    }
    const el = document.querySelector(sel);
    if (!el) return [];
    const out: string[] = [piece(el)];
    let cur = el.parentElement;
    for (let i=0; i<3 && cur; i++) {
      out.unshift(piece(cur));
      cur = cur.parentElement;
    }
    return out;
  }, selector);
  return chain.filter(Boolean);
}
