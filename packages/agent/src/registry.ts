import { toolRecord } from "./tools/record.js";
import { toolRun } from "./tools/run.js";
import { toolScript } from "./tools/script.js";
import { toolAdviseSelectors } from "./tools/selectors.js";

export const ToolRegistry = {
  record: toolRecord,
  run: toolRun,
  script: toolScript,
  "advise-selectors": toolAdviseSelectors,
};
