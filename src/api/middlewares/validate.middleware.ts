import type { Request, Response, NextFunction } from "express";
import Ajv from "ajv";
import type { Schema, ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { ValidationError } from "../../utils/errors";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Builds an Express middleware that validates req.body against the given
 * JSONSchema. On failure, forwards a ValidationError with a readable message.
 *
 * @param schema - The JSONSchema to validate the request body against.
 * @returns An Express middleware function.
 */
export function validateBody(schema: Schema) {
  const validate = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate(req.body);

    if (!valid) {
      const message = (validate.errors as ErrorObject[] | null | undefined)
        ?.map((err) => `${err.instancePath || "body"} ${err.message}`)
        .join(", ");

      return next(new ValidationError(message || "Invalid input data"));
    }

    next();
  };
}