import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../../utils/errors";

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

/**
 * Verifies the JWT sent in the Authorization header and attaches the
 * decoded userId to the request object.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AuthenticationError("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      email: string;
    };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return next (new AuthenticationError ("invalid or expired token"));
  }
}