import {
  createTask,
  findTasksByUserId,
  findTaskByIdAndUserId,
  updateTask,
  deleteTask,
  CreateTaskData,
  UpdateTaskData,
} from "../persistence/task.repository";

const VALID_STATUSES = ["pendiente", "en curso", "completada"];

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  status?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: string;
}

/**
 * Creates a new task for the given user.
 *
 * @param userId - Id of the authenticated user.
 * @param data - Task data.
 * @returns The newly created task.
 */
export async function createTaskForUser(userId: number, data: CreateTaskInput) {
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new Error("Invalid status value");
  }

  const taskData: CreateTaskData = {
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    status: data.status,
    userId,
  };

  return createTask(taskData);
}

/**
 * Returns all tasks belonging to the given user.
 *
 * @param userId - Id of the authenticated user.
 * @returns The user's tasks.
 */
export async function getTasksForUser(userId: number) {
  return findTasksByUserId(userId);
}

/**
 * Returns a single task, scoped to its owner.
 *
 * @param id - Task id.
 * @param userId - Id of the authenticated user.
 * @returns The task.
 * @throws Error when the task doesn't exist or doesn't belong to the user.
 */
export async function getTaskForUser(id: number, userId: number) {
  const task = await findTaskByIdAndUserId(id, userId);

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
}

/**
 * Updates a task, scoped to its owner.
 *
 * @param id - Task id.
 * @param userId - Id of the authenticated user.
 * @param data - Fields to update.
 * @returns The updated task.
 * @throws Error when the task doesn't exist, doesn't belong to the user,
 * or the status value is invalid.
 */
export async function updateTaskForUser(id: number, userId: number, data: UpdateTaskInput) {
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new Error("Invalid status value");
  }

  const updateData: UpdateTaskData = {
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    status: data.status,
  };

  const task = await updateTask(id, userId, updateData);

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
}

/**
 * Deletes a task, scoped to its owner.
 *
 * @param id - Task id.
 * @param userId - Id of the authenticated user.
 * @throws Error when the task doesn't exist or doesn't belong to the user.
 */
export async function deleteTaskForUser(id: number, userId: number) {
  const deleted = await deleteTask(id, userId);

  if (!deleted) {
    throw new Error("Task not found");
  }
}