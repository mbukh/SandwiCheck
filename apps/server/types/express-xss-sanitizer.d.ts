declare module 'express-xss-sanitizer' {
  import type { RequestHandler } from 'express';

  interface XssOptions {
    allowedKeys?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedTags?: string[];
  }

  export function xss(options?: XssOptions): RequestHandler;
  export function sanitize<T>(data: T, options?: XssOptions): T;
}
