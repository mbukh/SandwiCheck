/*
 * Error-code vocabulary shared by client and server. The server's auth flow
 * stamps these onto `ApiErrorResponse.error.code`; the client switches on them
 * to render the matching recovery UI (e.g. the confirm-email page). Keeping the
 * literals here is the single source of truth that keeps both sides in lockstep.
 */
export const ERROR_CODE = {
  tokenExpired: 'TOKEN_EXPIRED',
  tokenInvalid: 'TOKEN_INVALID',
  maxResends: 'MAX_RESENDS',
  emailNotConfirmed: 'EMAIL_NOT_CONFIRMED',
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
