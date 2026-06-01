import type { ParamsDictionary, Query } from 'express-serve-static-core';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async route handler so any rejected promise is forwarded to Express's
 * error-handling middleware via next(). Replaces the express-async-handler package
 * with a signature that allows handlers to return values (e.g. `return res.json()`).
 *
 * Generic over Express's request/response type parameters: pass a DTO to get a
 * fully typed `req.body` (and/or params, query, response), e.g.
 * `asyncHandler<ParamsDictionary, ApiResponse<UserDocument>, LoginDto>(...)`.
 */
const asyncHandler =
  <
    P = ParamsDictionary,
    ResBody = unknown,
    /*
     * Mirrors Express's own `Request` body default so handlers that don't opt
     * into a DTO keep a permissive `req.body`. Opt in by passing generics.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReqBody = any,
    ReqQuery = Query,
  >(
    handler: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>,
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export default asyncHandler;
