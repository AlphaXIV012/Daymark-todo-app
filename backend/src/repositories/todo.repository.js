import { pool } from "../config/database.js";

const TODO_COLUMNS = `
  id,
  user_id AS "userId",
  task,
  completed,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function findAllForUser(userId) {
  const result = await pool.query(
    `SELECT ${TODO_COLUMNS}
       FROM todos
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findAll() {
  const result = await pool.query(
    `SELECT ${TODO_COLUMNS}
       FROM todos
      ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function findByIdForUser(id, userId) {
  const result = await pool.query(
    `SELECT ${TODO_COLUMNS}
       FROM todos
      WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function create({ userId, task }) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, task)
     VALUES ($1, $2)
     RETURNING ${TODO_COLUMNS}`,
    [userId, task]
  );
  return result.rows[0];
}

export async function updateForUser(id, userId, updates) {
  const result = await pool.query(
    `UPDATE todos
        SET task = COALESCE($3, task),
            completed = COALESCE($4, completed),
            updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING ${TODO_COLUMNS}`,
    [id, userId, updates.task ?? null, updates.completed ?? null]
  );
  return result.rows[0] ?? null;
}

export async function deleteForUser(id, userId) {
  const result = await pool.query(
    `DELETE FROM todos
      WHERE id = $1 AND user_id = $2
      RETURNING id`,
    [id, userId]
  );
  return result.rowCount > 0;
}

export async function findByCompletionForUser(userId, completed) {
  const result = await pool.query(
    `SELECT ${TODO_COLUMNS}
       FROM todos
      WHERE user_id = $1 AND completed = $2
      ORDER BY created_at DESC`,
    [userId, completed]
  );
  return result.rows;
}
