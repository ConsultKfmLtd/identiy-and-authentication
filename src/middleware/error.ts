import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: "NOT_FOUND" });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      details: err.flatten()
    });
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  const code = err?.code ?? "INTERNAL_ERROR";
  const message = err?.message ?? "Something went wrong";

  // Don’t leak stack traces in prod
  if (process.env.NODE_ENV === "production") {
    return res.status(status).json({ error: code });
  }

  return res.status(status).json({ error: code, message, stack: err?.stack });
}
