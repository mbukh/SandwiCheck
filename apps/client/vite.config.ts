/* eslint-disable unicorn/import-style */
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    // `@/…` → apps/client/src/… (keeps deep imports short; mirrors tsconfig `paths`).
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    alias: {
      '\\.(css|less|sass|scss)$': resolve(__dirname, '__mocks__/styleMock.ts'),
      '\\.(gif|ttf|eot|svg)$': resolve(__dirname, '__mocks__/fileMock.ts'),
      '^swiper/react$': resolve(__dirname, '__mocks__/swiper.tsx'),
      '^swiper/css$': resolve(__dirname, '__mocks__/styleMock.ts'),
      '^swiper/css/(.*)$': resolve(__dirname, '__mocks__/styleMock.ts'),
    },
  },
});
