import type { NextFunction, Request, Response } from "express";
import { isHttpError } from "http-errors";
import { StorageError } from "../errors/StorageError";

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

  if (err instanceof StorageError) {
    if (err.code === "NETWORK_ERROR") {
      res.status(503).json({ error: err.message, code: err.code });
      return;
    }
    if (err.code === "UPSTREAM_ERROR") {
      res.status(502).json({ error: err.message, code: err.code });
      return;
    }
  }

  const status = isHttpError(err) ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";

  res.status(status).json({ error: message });
}
