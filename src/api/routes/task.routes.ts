import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { create, getAll, getOne, update, remove } from "../../controllers/task.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Finish report" }
 *               description: { type: string, example: "Quarterly report" }
 *               dueDate: { type: string, format: date, example: "2026-09-30" }
 *               status: { type: string, enum: [pendiente, "en curso", completada] }
 *     responses:
 *       201: { description: Task created }
 *       401: { description: No token provided or invalid token }
 *   get:
 *     summary: List all tasks for the authenticated user
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of tasks }
 *       401: { description: No token provided or invalid token }
 */
router.post("/", validateBody(createTaskSchema), create);
router.get("/", getAll);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by id
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task found }
 *       404: { description: Task not found }
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date }
 *               status: { type: string, enum: [pendiente, "en curso", completada] }
 *     responses:
 *       200: { description: Task updated }
 *       404: { description: Task not found }
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task deleted }
 *       404: { description: Task not found }
 */
router.get("/:id", getOne);
router.put("/:id", validateBody(updateTaskSchema), update);
router.delete("/:id", remove);

export default router;