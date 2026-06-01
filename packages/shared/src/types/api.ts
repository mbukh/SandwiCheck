/**
 * Shared API contract types: the JSON envelopes every SandwiCheck endpoint
 * returns. Framework-agnostic so client and server describe one wire contract.
 */

/** Standard JSON envelope returned by every successful SandwiCheck endpoint. */
export interface ApiResponse<TData = never> {
  success: boolean;
  message?: string;
  count?: number;
  data?: TData;
}

/** JSON envelope returned by the server's error handler for every failed request. */
export interface ApiErrorResponse {
  success: false;
  error: {
    status?: number;
    message: string;
    /** Distinguishes error variants, e.g. 'TOKEN_EXPIRED', 'MAX_RESENDS', or 11000 (Mongo duplicate key). */
    code?: string | number;
    /** Present only on 429 responses (email-confirmation resend cooldown). */
    cooldownRemainingMs?: number;
  };
}
