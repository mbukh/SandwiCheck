import type { ApiErrorResponse, ApiResponse } from '@sandwicheck/shared';

/**
 * Permissive client-side view of any API response. The server sends either an
 * `ApiResponse<T>` (2xx) or an `ApiErrorResponse` (4xx/5xx); the fetch wrapper
 * surfaces whichever came back, so every field is optional at the call site.
 */
export type ApiResult<TData = unknown> = Partial<ApiResponse<TData>> & {
  error?: ApiErrorResponse['error'];
};
