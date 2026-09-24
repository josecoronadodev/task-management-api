import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/errors";

/**
 * Centralized error handler. Must be registered last, after all routes.
 * Converts known AppError instances into consistent JSON responses,
 * and falls back to 500 for anything unexpected.
 *
 * @param err - The error thrown anywhere in the request lifecycle.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function (required for Express to recognize this as an error handler).
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong",
  });
}