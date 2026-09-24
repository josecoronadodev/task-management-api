import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../api/middlewares/auth.middleware";
import {
  createTaskForUser,
  getTasksForUser,
  getTaskForUser,
  updateTaskForUser,
  deleteTaskForUser,
} from "../services/task.service";

/**
 * Handles task creation for the authenticated user.
 */
export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, description, dueDate, status } = req.body;
    const task = await createTaskForUser(req.userId as number, { title, description, dueDate, status });
    return res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles listing all tasks for the authenticated user.
 */
export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const tasks = await getTasksForUser(req.userId as number);
    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching a single task by id for the authenticated user.
 */
export async function getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const task = await getTaskForUser(id, req.userId as number);
    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles updating a task for the authenticated user.
 */
export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { title, description, dueDate, status } = req.body;
    const task = await updateTaskForUser(id, req.userId as number, { title, description, dueDate, status });
    return res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles deleting a task for the authenticated user.
 */
export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await deleteTaskForUser(id, req.userId as number);
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
}