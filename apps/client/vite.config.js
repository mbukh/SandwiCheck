/* eslint-disable unicorn/import-style */
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('vite').UserConfig} */
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
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    /*
     * setupFiles: ['./src/setupTests.js'],
     * environmentOptions: {
     *   jsdom: {
     *     url: 'http://localhost:/SandwiCheck',
     *   },
     * },
     */

    alias: {
      '\\.(css|less|sass|scss)$': resolve(__dirname, '__mocks__/styleMock.js'),
      '\\.(gif|ttf|eot|svg)$': resolve(__dirname, '__mocks__/fileMock.js'),
      '^swiper/react$': resolve(__dirname, '__mocks__/swiper.js'),
      '^swiper/css$': resolve(__dirname, '__mocks__/styleMock.js'),
      '^swiper/css/(.*)$': resolve(__dirname, '__mocks__/styleMock.js'),
    },
  },
});
