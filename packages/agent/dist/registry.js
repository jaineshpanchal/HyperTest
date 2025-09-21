import { toolRecord } from "./tools/record.js";
import { toolScript } from "./tools/script.js";
import { toolRun } from "./tools/run.js";
import { toolAdviseSelectors } from "./tools/selectors.js";
export const ToolRegistry = {
    record: toolRecord,
    script: toolScript,
    run: toolRun,
    "advise-selectors": toolAdviseSelectors
};
