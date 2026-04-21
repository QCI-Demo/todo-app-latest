import type { NextFunction, Request, Response } from "express";

type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export function wrapRoute(handler: RouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = handler(req, res, next);
      if (result !== undefined && typeof (result as Promise<void>).catch === "function") {
        (result as Promise<void>).catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
}
