import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { errorHandler } from "../src/middleware/errorHandler";
import { wrapRoute } from "../src/middleware/wrapRoute";

describe("errorHandler", () => {
  it("sends JSON error for HttpError", () => {
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    const err = createError(400, "Bad");
    errorHandler(err, {} as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect((res as unknown as { json: jest.Mock }).json).toHaveBeenCalledWith({
      error: "Bad"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("uses 500 for non-HttpError non-Error", () => {
    const res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    errorHandler("oops", {} as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect((res as unknown as { json: jest.Mock }).json).toHaveBeenCalledWith({
      error: "Internal Server Error"
    });
  });

  it("delegates to next when headers already sent", () => {
    const res = {
      headersSent: true,
      status: jest.fn(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    errorHandler(new Error("late"), {} as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("wrapRoute", () => {
  it("forwards sync errors to next", () => {
    const next = jest.fn();
    const wrapped = wrapRoute(() => {
      throw new Error("boom");
    });
    wrapped({} as Request, {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "boom" }));
  });

  it("forwards async rejections to next", async () => {
    const next = jest.fn();
    const wrapped = wrapRoute(async () => {
      throw new Error("async boom");
    });
    wrapped({} as Request, {} as Response, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "async boom" }));
  });
});
