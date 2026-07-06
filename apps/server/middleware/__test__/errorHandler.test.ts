import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import logger from '#utils/logger.ts';
import errorHandler from '../errorHandler.ts';

// vi.mock is hoisted above the import above, so errorHandler picks up the stubbed logger.
vi.mock('#utils/logger.ts', () => ({ default: { error: vi.fn() } }));

interface ErrorPayload {
  success: boolean;
  error: { status?: number; message: string; code?: string | number };
}

const runErrorHandler = (err: unknown): { statusMock: ReturnType<typeof vi.fn>; payload: ErrorPayload } => {
  const req = { path: '/api/v1/users/u1', method: 'PUT' } as unknown as Request;
  const statusMock = vi.fn();
  const jsonMock = vi.fn();
  const res = { status: statusMock, json: jsonMock } as unknown as Response;
  const next: NextFunction = vi.fn();

  errorHandler(err, req, res, next);

  return { statusMock, payload: jsonMock.mock.calls[0]?.[0] as ErrorPayload };
};

describe('errorHandler multer handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a non-size MulterError to a 400 instead of a 500', () => {
    const err = Object.assign(new Error('Unexpected field'), { name: 'MulterError', code: 'LIMIT_UNEXPECTED_FILE' });

    const { statusMock, payload } = runErrorHandler(err);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(payload.error.status).toBe(400);
    expect(payload.error.message).toBe('File upload error: Unexpected field');
  });

  it('keeps the friendly size message for LIMIT_FILE_SIZE (still 400)', () => {
    process.env.MAX_UPLOAD_SIZE_IN_BYTES = String(2 * 1024 * 1024);
    const err = Object.assign(new Error('File too large'), { name: 'MulterError', code: 'LIMIT_FILE_SIZE' });

    const { statusMock, payload } = runErrorHandler(err);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(payload.error.message).toContain('The file is too large');
    expect(payload.error.message).toContain('2MB');
  });
});

describe('errorHandler duplicate-key handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a static message and never reflects the duplicated value', () => {
    const err = Object.assign(
      new Error(
        'E11000 duplicate key error collection: app.users index: email_1 dup key: { email: "victim@example.com" }',
      ),
      { code: 11_000 },
    );

    const { statusMock, payload } = runErrorHandler(err);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(payload.error.message).toBe('A record with these details already exists');
    expect(payload.error.message).not.toContain('victim@example.com');
  });
});

describe('errorHandler 5xx detail leak prevention', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a generic message and omits the code on an unrecognized (500) error', () => {
    const err = Object.assign(new Error('connect ECONNREFUSED 10.0.0.5:5432'), { code: 'ECONNREFUSED' });

    const { statusMock, payload } = runErrorHandler(err);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(payload.error.message).toBe('Internal Server Error');
    expect(payload.error.code).toBeUndefined();
  });

  it('keeps the message and structured code on a 4xx error', () => {
    const err = Object.assign(new Error('Please confirm your email'), {
      status: 401,
      code: 'EMAIL_NOT_CONFIRMED',
    });

    const { statusMock, payload } = runErrorHandler(err);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(payload.error.message).toBe('Please confirm your email');
    expect(payload.error.code).toBe('EMAIL_NOT_CONFIRMED');
  });
});

describe('errorHandler when the response was already sent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the error, then delegates to next(err) without writing a second response', () => {
    vi.mocked(logger.error).mockClear();
    const err = new Error('late error');
    const status = vi.fn();
    const json = vi.fn();
    const res = { headersSent: true, status, json } as unknown as Response;
    const next: NextFunction = vi.fn();
    const req = { path: '/api/v1/auth/forgot-password', method: 'POST' } as unknown as Request;

    errorHandler(err, req, res, next);

    // The error must still be recorded even though the response already started.
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(err);
    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });
});
