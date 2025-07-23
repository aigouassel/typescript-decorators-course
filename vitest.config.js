import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test-setup.ts'],
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts'
    ],
    isolate: true,
    testTimeout: 10000,
    reporter: ['verbose'],
    ui: true,
    open: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-setup.ts',
        'vitest.config.js',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    },
    // Enhanced test organization
    outputFile: {
      html: './test-results/index.html',
      json: './test-results/results.json'
    }
  },
  esbuild: {
    target: 'es2020'
  }
});