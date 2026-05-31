/* eslint-disable no-console */
import { debug } from '@/constants/debug';
import type { ApiResult } from '@/types/api';

export function log(...args: unknown[]): void {
  if (debug) console.log(...args);
}

export function logResponse(title: string, response: ApiResult): void {
  if (response.success) {
    if (debug && response.message) console.log(title, '(message):', response.message);
    if (debug && response.data) console.log(title, '(response):', response.data);
  } else {
    const errorMessage = response.error?.message || response.message || response.error || 'Unknown error';
    if (debug) console.log(title, '(error):', errorMessage);
  }
}
