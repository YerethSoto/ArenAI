import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { Subject } from '../types.js';

export async function listSubjects() {
  const result = await db.query<Subject>(
    `SELECT id_subject, name_subject
     FROM subject
     ORDER BY name_subject`
  );

  return result.rows;
}

export async function createSubject(payload: { name: string }) {
  const insertResult = await db.query<ResultSetHeader>(
    `INSERT INTO subject (name_subject)
     VALUES (?)`,
    [payload.name]
  );

  const created = await db.query<Subject>(
    `SELECT id_subject, name_subject
     FROM subject
     WHERE id_subject = ?`,
    [insertResult.rows[0].insertId]
  );

  return created.rows[0];
}
