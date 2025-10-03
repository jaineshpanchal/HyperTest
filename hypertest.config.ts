import type { HyperConfig } from '@hypertest/core';

const config: HyperConfig = {
  outputDir: 'artifacts',
  retries: 0,
  reporter: 'list',
  projects: [
    {
      name: 'web',
      use: {
        browserName: 'chromium',
        headless: true,
        baseURL: 'https://example.com'
      }
    }
  ]
};

export default config;
