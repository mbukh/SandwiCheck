import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('errorHandler when the response was already sent', () => {
  it('delegates to next(err) without writing a second response', () => {
    const err = new Error('late error');
    const status = vi.fn();
    const json = vi.fn();
    const res = { headersSent: true, status, json } as unknown as Response;
    const next: NextFunction = vi.fn();
    const req = { path: '/api/v1/auth/forgot-password', method: 'POST' } as unknown as Request;

    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });
});
