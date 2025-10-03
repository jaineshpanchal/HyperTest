export type TestId = string;
export type RunId = string;

export interface ReporterConfig {
  kind: 'list' | 'json' | 'junit' | string;
  options?: Record<string, unknown>;
}

export interface RunnerOptions {
  browserName?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  baseURL?: string;
  storageState?: string;
}

export interface SelectorPolicy {
  prefer?: Array<'dataTest' | 'roleName' | 'labelProximity' | 'text' | 'domAnchor'>;
}

export interface ProjectConfig {
  name: string;
  use: RunnerOptions;
  selectors?: SelectorPolicy;
}

export interface HyperConfig {
  outputDir: string;
  retries?: number;
  reporter: ReporterConfig | string | Array<ReporterConfig | string>;
  projects: ProjectConfig[];
  plugins?: { name: string; options?: Record<string, unknown> }[];
  env?: Record<string, string>;
}

export interface ArtifactPaths {
  video?: string;
  trace?: string;
  domSnapshot?: string;
  network?: string;
  logs?: string;
}

export interface TestArtifactIndex {
  runId: RunId;
  testId: TestId;
  title: string;
  status: 'passed' | 'failed' | 'flaky' | 'skipped';
  startTime: number;
  endTime: number;
  retries: number;
  attempt: number;
  paths: ArtifactPaths;
}
