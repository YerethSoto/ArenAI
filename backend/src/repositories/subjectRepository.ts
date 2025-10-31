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
  const result = await db.query<Subject>(
    `INSERT INTO subject (name_subject)
     VALUES ($1)
     RETURNING id_subject, name_subject`,
    [payload.name]
  );

  return result.rows[0];
}
