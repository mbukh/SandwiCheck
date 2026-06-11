/* eslint-disable unicorn/import-style */
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
 * GitHub Pages has no SPA rewrite engine (the Netlify-style public/_redirects is
 * ignored there) — it serves 404.html for any unknown path. Emitting 404.html as a
 * copy of index.html lets deep links like /create boot the app so the client router
 * can resolve them, instead of returning GitHub's default 404.
 */
const spaPagesFallback = (): Plugin => ({
  name: 'spa-pages-404-fallback',
  closeBundle() {
    const outDir = resolve(__dirname, 'build');
    const indexHtml = resolve(outDir, 'index.html');
    /*
     * closeBundle also runs while a FAILED build is being torn down; throwing
     * ENOENT here would replace the real build error with a misleading one.
     */
    if (!existsSync(indexHtml)) {
      return;
    }
    copyFileSync(indexHtml, resolve(outDir, '404.html'));
  },
});

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
    spaPagesFallback(),
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
