/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_SERVER: string;
  readonly VITE_HOST: string;
  readonly VITE_ENV?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

