import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/fixtures/',
        '**/*.test.ts',
        'vitest.config.ts',
      ],
    },
  },
});
