import type { NextFunction, Request, Response } from "express";
import { isHttpError } from "http-errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = isHttpError(err) ? err.status : 500;
  const message =
    err instanceof Error ? err.message : "Internal Server Error";

  res.status(status).json({ error: message });
}
