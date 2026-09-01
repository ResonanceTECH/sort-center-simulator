/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { projectsApiMockPlugin } from './vite.projectsApiMock';
import { reportsApiMockPlugin } from './vite.reportsApiMock';

export default defineConfig({
  plugins: [react(), projectsApiMockPlugin(), reportsApiMockPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    clearMocks: true,
  },
});
