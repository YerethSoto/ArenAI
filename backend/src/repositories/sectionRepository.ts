import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { Section } from '../types.js';

export async function listSectionsByInstitution(institutionId: number) {
  const result = await db.query<Section>(
    `SELECT id_section, name, grade, id_institution
     FROM section
     WHERE id_institution = ?
     ORDER BY grade, name`,
    [institutionId]
  );

  return result.rows;
}

export async function createSection(payload: { name: string; grade: string; institutionId: number }) {
  const insertResult = await db.query<ResultSetHeader>(
    `INSERT INTO section (name, grade, id_institution)
     VALUES (?, ?, ?)`,
    [payload.name, payload.grade, payload.institutionId]
  );

  const newSection = await db.query<Section>(
    `SELECT id_section, name, grade, id_institution
     FROM section
     WHERE id_section = ?`,
    [insertResult.rows[0].insertId]
  );

  return newSection.rows[0];
}
