import type { Schema } from "ajv";

const STATUS_VALUES = ["pendiente", "en curso", "completada"];

export const createTaskSchema: Schema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1 },
    description: { type: "string" },
    dueDate: { type: "string", format: "date" },
    status: { type: "string", enum: STATUS_VALUES },
  },
  required: ["title"],
  additionalProperties: false,
};

export const updateTaskSchema: Schema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1 },
    description: { type: "string" },
    dueDate: { type: "string", format: "date" },
    status: { type: "string", enum: STATUS_VALUES },
  },
  additionalProperties: false,
  minProperties: 1,
};