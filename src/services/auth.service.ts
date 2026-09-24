import bcrypt from "bcrypt";
import { ConflictError, AuthenticationError } from "../utils/errors";
import {
  createUser,
  findUserByEmail,
} from "../persistence/user.repository";

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

/**
 * Registers a new user after validating that the email is not already used.
 *
 * @param data - User registration data.
 * @returns The created user.
 * @throws Error when the email is already registered.
 */
export async function registerUser(data: RegisterUserData) {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  return user;
}

import jwt from "jsonwebtoken";

export interface LoginUserData {
  email: string;
  password: string;
}

/**
 * Verifies user credentials and returns a signed JWT when valid.
 *
 * @param data - Login credentials.
 * @returns The signed JWT.
 * @throws Error when the email doesn't exist or the password doesn't match.
 */
export async function loginUser(data: LoginUserData) {
  const user = await findUserByEmail(data.email);

  if (!user) {
  throw new AuthenticationError("Invalid credentials");
  }
  

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid credentials");
  }

  const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET as string,
  { expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as jwt.SignOptions["expiresIn"] }
  );

  return token;
}
