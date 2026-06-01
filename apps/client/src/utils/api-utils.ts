import type { ApiResult } from '@/types/api';
import type { FetchApiError, FetchApiResponse } from './fetch-api.ts';

/**
 * Unwraps a fetch-api call to the JSON envelope the server returned, whether the
 * request succeeded (`ApiResponse<T>`) or failed (`ApiErrorResponse`).
 */
export async function handleResponse<TData = unknown>(
  requestFunction: () => Promise<FetchApiResponse>,
): Promise<ApiResult<TData>> {
  try {
    const response = await requestFunction();
    return response.data as ApiResult<TData>;
  } catch (error) {
    return (error as FetchApiError).response.data as ApiResult<TData>;
  }
}
