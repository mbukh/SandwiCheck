/**
 * SHARED-READY: Shared API contract types.
 *
 * Kept framework-agnostic (no Express/Mongoose imports) so they can be lifted
 * into `packages/shared-*` and reused by the client once it migrates to TS.
 * The client already depends on this exact response envelope at runtime.
 */

/** Standard JSON envelope returned by every SandwiCheck endpoint. */
export interface ApiResponse<TData = never> {
  success: boolean;
  message?: string;
  count?: number;
  data?: TData;
}
