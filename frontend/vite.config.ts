import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { projectsApiMockPlugin } from './vite.projectsApiMock';
import { reportsApiMockPlugin } from './vite.reportsApiMock';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useMocks = env.VITE_USE_API_MOCKS !== 'false';

  return {
    plugins: [
      react(),
      ...(useMocks ? [projectsApiMockPlugin(), reportsApiMockPlugin()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', '@gsap/react', 'maplibre-gl'],
    },
    server: {
      port: 3000,
      open: true,
      proxy: useMocks
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              ws: true,
            },
          },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
    },
  };
});
