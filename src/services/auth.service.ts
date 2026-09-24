import bcrypt from "bcrypt";
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