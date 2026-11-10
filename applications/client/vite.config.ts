import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

import {
  APPLICATION_BACKGROUND_COLOR,
  APPLICATION_DESCRIPTION,
  APPLICATION_NAME,
  APPLICATION_THEME_COLOR,
  CLIENT_DEVELOPMENT_PORT,
  SERVER_DEVELOPMENT_ORIGIN,
} from './src/constants/application.constants';
import { APPLICATION_ROUTE_PATHS } from '@habit-tracker/contracts';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'serviceWorker.js',
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        name: APPLICATION_NAME,
        short_name: APPLICATION_NAME,
        description: APPLICATION_DESCRIPTION,
        theme_color: APPLICATION_THEME_COLOR,
        background_color: APPLICATION_BACKGROUND_COLOR,
        display: 'standalone',
        start_url: APPLICATION_ROUTE_PATHS.TODAY,
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: CLIENT_DEVELOPMENT_PORT,
    proxy: {
      '/api': {
        target: SERVER_DEVELOPMENT_ORIGIN,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/main.ts', 'src/test/**'],
    },
  },
});
