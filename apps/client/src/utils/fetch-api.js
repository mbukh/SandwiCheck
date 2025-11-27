/**
 * Fetch API wrapper that provides axios-compatible interface
 * Replaces axios.create() with native fetch API
 */

/**
 * Creates a fetch-based API client with axios-compatible interface
 * @param {string} baseURL - Base URL for all requests
 * @param {Object} defaultHeaders - Default headers to include in all requests
 * @returns {Object} API client with get, post, put, delete methods
 */
export function createFetchApi(baseURL, defaultHeaders = {}) {
  // Store defaults for compatibility (api.defaults.headers access)
  const defaults = {
    headers: { ...defaultHeaders },
  };

  /**
   * Builds full URL from baseURL and path, handling query parameters
   */
  function buildUrl(path, params = {}) {
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
            for (const item of value) searchParams.append(key, item);
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

  /**
   * Determines if body should be serialized as JSON
   */
  function shouldSerializeAsJSON(body) {
    return (
      body !== null &&
      body !== undefined &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      typeof body !== 'string'
    );
  }

  /**
   * Prepares headers for the request
   */
  function prepareHeaders(options = {}) {
    const headers = { ...defaults.headers, ...options.headers };

    // For FormData, exclude Content-Type to let browser set boundary automatically
    if (options.body instanceof FormData) {
      const { 'Content-Type': _, ...headersWithoutContentType } = headers;
      return headersWithoutContentType;
    }

    // For JSON bodies, ensure Content-Type is set if not provided
    if (shouldSerializeAsJSON(options.body) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  /**
   * Parses response body based on Content-Type
   */
  async function parseResponseBody(response) {
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

  /**
   * Core request function
   */
  async function request(url, options = {}) {
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
        body,
        credentials: 'include', // Equivalent to withCredentials: true
      });

      // Parse response body
      const data = await parseResponseBody(response);

      // Create axios-compatible response object
      const axiosResponse = {
        data,
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
        let errorData = data;
        if (!errorData || typeof errorData === 'string') {
          // If data is string or null, wrap it in expected structure
          errorData = {
            success: false,
            error: {
              message: typeof errorData === 'string' ? errorData : response.statusText,
              status: response.status,
            },
          };
        } else if (!errorData.error && !errorData.success) {
          // If data is an object but doesn't match expected structure, normalize it
          errorData = {
            success: false,
            error: {
              message: errorData.message || response.statusText,
              status: response.status,
            },
          };
        }

        const error = {
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
      if (error.response) {
        throw error;
      }

      /*
       * Network errors (fetch rejections)
       * Match axios error structure for catch blocks
       */
      throw {
        response: {
          data: {
            success: false,
            error: {
              message: error.message || 'Network error',
              status: 0,
            },
          },
          status: 0,
        },
      };
    }
  }

  // Create API object with methods
  const api = {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),
    put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
    defaults, // Expose defaults for compatibility (api.defaults.headers)
  };

  return api;
}
