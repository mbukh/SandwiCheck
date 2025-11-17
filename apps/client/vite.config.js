import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/SandwiCheck',
      },
    },
    alias: {
      '^axios$': 'axios/dist/node/axios.cjs',
      '\\.(css|less|sass|scss)$': resolve(__dirname, '__mocks__/styleMock.js'),
      '\\.(gif|ttf|eot|svg)$': resolve(__dirname, '__mocks__/fileMock.js'),
      '^swiper/react$': resolve(__dirname, '__mocks__/swiper.js'),
      '^swiper/css$': resolve(__dirname, '__mocks__/styleMock.js'),
      '^swiper/css/(.*)$': resolve(__dirname, '__mocks__/styleMock.js'),
    },
  },
});

