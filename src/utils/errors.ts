/**
 * Base class for all application-specific errors.
 * Carries an HTTP status code so the error middleware knows how to respond.
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when a requested resource doesn't exist (or doesn't belong to the user).
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Thrown when login credentials are invalid or a token is missing/invalid.
 */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

/**
 * Thrown when input data fails validation.
 */
export class ValidationError extends AppError {
  constructor(message = "Invalid input data") {
    super(message, 400);
  }
}

/**
 * Thrown when an action conflicts with existing data (e.g. duplicate email).
 */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}