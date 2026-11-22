import { pool } from "../config/database.js";

export async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, password_hash AS "passwordHash", role
       FROM users
      WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findById(id) {
  const result = await pool.query(
    `SELECT id, email, role, created_at AS "createdAt"
       FROM users
      WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createUser({ email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, role, created_at AS "createdAt"`,
    [email, passwordHash]
  );
  return result.rows[0];
}
