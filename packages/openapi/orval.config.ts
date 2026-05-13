import type { OrvalConfig } from 'orval';

const config: OrvalConfig = {
  inquiryApi: {
    input: './openapi.yaml',
    output: {
      target: '../apps/frontend/src/api.ts',
      client: 'react-query',
      mode: 'single'
    },
    override: {
      mutator: {
        path: '../apps/frontend/src/api.ts',
        name: 'fetcher'
      }
    }
  }
};

export default config;
