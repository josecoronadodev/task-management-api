import type { Schema } from "ajv";

export const registerSchema: Schema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 },
  },
  required: ["name", "email", "password"],
  additionalProperties: false,
};

export const loginSchema: Schema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 1 },
  },
  required: ["email", "password"],
  additionalProperties: false,
};