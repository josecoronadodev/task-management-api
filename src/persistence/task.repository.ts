import { pool } from "./database";

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  status?: string;
  userId: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: string;
}

/**
 * Creates a new task owned by the given user.
 *
 * @param data - Task data, including the owning user's id.
 * @returns The newly created task.
 */
export async function createTask(data: CreateTaskData) {
  const result = await pool.query(
    `
      INSERT INTO tasks (title, description, due_date, status, user_id)
      VALUES ($1, $2, $3, COALESCE($4, 'pendiente'), $5)
      RETURNING id, title, description, due_date, status, user_id, created_at
    `,
    [data.title, data.description ?? null, data.dueDate ?? null, data.status ?? null, data.userId]
  );

  return result.rows[0];
}

/**
 * Returns all tasks belonging to a specific user.
 *
 * @param userId - Id of the authenticated user.
 * @returns The user's tasks.
 */
export async function findTasksByUserId(userId: number) {
  const result = await pool.query(
    `
      SELECT id, title, description, due_date, status, user_id, created_at
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

/**
 * Finds a single task by id, scoped to its owner.
 *
 * @param id - Task id.
 * @param userId - Id of the authenticated user.
 * @returns The task, or null if it doesn't exist or doesn't belong to the user.
 */
export async function findTaskByIdAndUserId(id: number, userId: number) {
  const result = await pool.query(
    `
      SELECT id, title, description, due_date, status, user_id, created_at
      FROM tasks
      WHERE id = $1 AND user_id = $2
    `,
    [id, userId]
  );

  return result.rows[0] ?? null;
}

/**
 * Updates a task, scoped to its owner. Only provided fields are updated.
 *
 * @param id - Task id.
 * @param userId - Id of the authenticated user.
 * @param data - Fields to update.
 * @returns The updated task, or null if it doesn't exist or doesn't belong to the user.
 */
export async function updateTask(id: number, userId: number, data: UpdateTaskData) {
  const result = await pool.query(
    `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        due_date = COALESCE($3, due_date),
        status = COALESCE($4, status)
      WHERE id = $5 AND user_id = $6
      RETURNING id, title, description, due_date, status, user_id, created_at
    `,
    [data.title ?? null, data.description ?? null, data.dueDate ?? null, data.status ?? null, id, userId]
  );

  return result.rows[0] ?? null;
}

/**
 * Deletes a task, scoped to its owner.
 *
 * @param id - Task id.
 * @param userId - Id of the authenticated user.
 * @returns True if a row was deleted, false otherwise.
 */
export async function deleteTask(id: number, userId: number) {
  const result = await pool.query(
    `
      DELETE FROM tasks
      WHERE id = $1 AND user_id = $2
    `,
    [id, userId]
  );

  return (result.rowCount ?? 0) > 0;
}