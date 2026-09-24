import { pool } from "./database";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

/**
 * Finds a user by their email address.
 *
 * @param email - User email address.
 * @returns The matching user or null when no user exists.
 */
export async function findUserByEmail(email: string) {
  const result = await pool.query(
    "SELECT id, name, email, password, created_at FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0] ?? null;
}

/**
 * Creates a new user in the database.
 *
 * @param data - User information including the hashed password.
 * @returns The newly created user.
 */
export async function createUser(data: CreateUserData) {
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `,
    [data.name, data.email, data.password]
  );

  return result.rows[0];
}