export type Target =
  | { dataTest: string }
  | { role: string; name?: string | RegExp }
  | { label: string }              // label proximity: getByLabel
  | { text: string | RegExp }      // visible text
  | { css: string }                // explicit css fallback
  | { domAnchor: string[] };       // precomputed short chain

export type Strategy = 'dataTest' | 'roleName' | 'labelProximity' | 'text' | 'css' | 'domAnchor';

export interface SelectorPolicy {
  prefer?: Strategy[];
  dataTestAttr?: string; // default: 'data-testid'
}
