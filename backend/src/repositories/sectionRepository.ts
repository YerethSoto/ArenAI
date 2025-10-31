import { db } from '../db/pool.js';
import type { Section } from '../types.js';

export async function listSectionsByInstitution(institutionId: number) {
  const result = await db.query<Section>(
    `SELECT id_section, name, grade, id_institution
     FROM section
     WHERE id_institution = $1
     ORDER BY grade, name`,
    [institutionId]
  );

  return result.rows;
}

export async function createSection(payload: { name: string; grade: string; institutionId: number }) {
  const result = await db.query<Section>(
    `INSERT INTO section (name, grade, id_institution)
     VALUES ($1, $2, $3)
     RETURNING id_section, name, grade, id_institution`,
    [payload.name, payload.grade, payload.institutionId]
  );

  return result.rows[0];
}
