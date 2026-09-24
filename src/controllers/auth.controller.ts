import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";

/**
 * Handles user registration requests.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express error middleware handler.
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles user login requests.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express error middleware handler.
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    const token = await loginUser({ email, password });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
}