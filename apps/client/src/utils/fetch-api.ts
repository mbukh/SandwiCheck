/**
 * Fetch API wrapper that provides an axios-compatible interface.
 * Replaces `axios.create()` with the native fetch API.
 */

/** Axios-compatible successful response. */
export interface FetchApiResponse<TData = unknown> {
  data: TData;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestOptions;
}

/** Axios-compatible error thrown for non-ok responses and network failures. */
export interface FetchApiError {
  response: {
    data: unknown;
    status: number;
    statusText?: string;
    headers?: Headers;
  };
}

/** Per-request options: standard `fetch` init plus query params and plain-object headers/body. */
export interface RequestOptions extends Omit<RequestInit, 'headers' | 'body'> {
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, unknown>;
}

export interface FetchApi {
  get: <TData = unknown>(url: string, options?: RequestOptions) => Promise<FetchApiResponse<TData>>;
  post: <TData = unknown>(url: string, body?: unknown, options?: RequestOptions) => Promise<FetchApiResponse<TData>>;
  put: <TData = unknown>(url: string, body?: unknown, options?: RequestOptions) => Promise<FetchApiResponse<TData>>;
  delete: <TData = unknown>(url: string, options?: RequestOptions) => Promise<FetchApiResponse<TData>>;
  defaults: { headers: Record<string, string> };
}

/**
 * Creates a fetch-based API client with an axios-compatible interface.
 */
export function createFetchApi(baseURL: string, defaultHeaders: Record<string, string> = {}): FetchApi {
  // Store defaults for compatibility (api.defaults.headers access)
  const defaults = {
    headers: { ...defaultHeaders },
  };

  /** Builds full URL from baseURL and path, handling query parameters. */
  function buildUrl(path: string, params: Record<string, unknown> = {}): string {
    // Normalize baseURL - remove trailing slash if present
    const normalizedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    // Normalize path - add leading slash if missing
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    let fullUrl = `${normalizedBase}${normalizedPath}`;

    // Handle query parameters
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        // Skip undefined and null values
        if (value !== undefined && value !== null) {
          // Handle arrays (e.g., dietaryPreferences: ['kosher', 'vegan'])
          if (Array.isArray(value)) {
            for (const item of value) searchParams.append(key, String(item));
          } else {
            searchParams.append(key, String(value));
          }
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    return fullUrl;
  }

  /** Determines if a body should be serialized as JSON. */
  function shouldSerializeAsJSON(body: unknown): boolean {
    return (
      body !== null &&
      body !== undefined &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      typeof body !== 'string'
    );
  }

  /** Prepares headers for the request. */
  function prepareHeaders(options: RequestOptions = {}): Record<string, string> {
    const headers: Record<string, string> = { ...defaults.headers, ...options.headers };

    // For FormData, exclude Content-Type to let the browser set the boundary automatically
    if (options.body instanceof FormData) {
      const { 'Content-Type': _contentType, ...headersWithoutContentType } = headers;
      return headersWithoutContentType;
    }

    // For JSON bodies, ensure Content-Type is set if not provided
    if (shouldSerializeAsJSON(options.body) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  /** Parses the response body based on Content-Type. */
  async function parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204 || !contentType) {
      return null;
    }

    // Parse JSON if content-type indicates JSON
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        // If JSON parsing fails, return text
        return await response.text();
      }
    }

    // Fallback to text
    return await response.text();
  }

  /** Core request function. */
  async function request<TData = unknown>(url: string, options: RequestOptions = {}): Promise<FetchApiResponse<TData>> {
    const { params, ...fetchOptions } = options;

    // Build full URL with query parameters
    const fullUrl = buildUrl(url, params);

    // Prepare headers
    const headers = prepareHeaders(fetchOptions);

    // Serialize body
    let body = fetchOptions.body;
    if (shouldSerializeAsJSON(body)) {
      body = JSON.stringify(body);
    }

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        body: body as BodyInit | null | undefined,
        credentials: 'include', // Equivalent to withCredentials: true
      });

      // Parse response body
      const data = await parseResponseBody(response);

      // Create axios-compatible response object
      const axiosResponse: FetchApiResponse<TData> = {
        data: data as TData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: fetchOptions,
      };

      // For non-ok responses, throw error (matching axios behavior)
      if (!response.ok) {
        /*
         * Server error format: { success: false, error: { status, message, code?, cooldownRemainingMs? } }
         * Ensure error structure matches what catch blocks expect
         * Normalize data to always be an object (handle non-JSON error responses)
         */
        let errorData: unknown = data;
        if (!errorData || typeof errorData === 'string') {
          // If data is string or null, wrap it in the expected structure
          errorData = {
            success: false,
            error: {
              message: typeof errorData === 'string' ? errorData : response.statusText,
              status: response.status,
            },
          };
        } else if (typeof errorData === 'object' && !('error' in errorData) && !('success' in errorData)) {
          // If data is an object but doesn't match the expected structure, normalize it
          const message =
            'message' in errorData && typeof errorData.message === 'string' ? errorData.message : response.statusText;
          errorData = {
            success: false,
            error: {
              message,
              status: response.status,
            },
          };
        }

        const error: FetchApiError = {
          response: {
            data: errorData,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          },
        };
        throw error;
      }

      return axiosResponse;
    } catch (error) {
      // If it's already our structured error, re-throw it
      if (error && typeof error === 'object' && 'response' in error) {
        throw error;
      }

      /*
       * Network errors (fetch rejections)
       * Match axios error structure for catch blocks
       */
      const message = error instanceof Error ? error.message : 'Network error';
      const networkError: FetchApiError = {
        response: {
          data: {
            success: false,
            error: {
              message,
              status: 0,
            },
          },
          status: 0,
        },
      };
      throw networkError;
    }
  }

  // Create API object with methods
  const api: FetchApi = {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),
    put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
    defaults, // Expose defaults for compatibility (api.defaults.headers)
  };

  return api;
}
