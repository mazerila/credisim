import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // Absolute asset paths so deep links like /s/<id> load correctly. Build with --base=./ for a relocatable copy.
  base: '/',
  plugins: [svelte()],
  test: {
    include: ['src/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
  },
});
