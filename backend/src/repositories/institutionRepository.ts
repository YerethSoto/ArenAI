import { db } from '../db/pool.js';
import type { Institution } from '../types.js';
import { parseNumeric } from '../utils/transformers.js';

export async function listInstitutions(): Promise<Array<Omit<Institution, 'score_average'> & { score_average: number | null }>> {
  const result = await db.query<Institution>(
    `SELECT id_institution, name_institution, score_average
     FROM institution
     ORDER BY name_institution`
  );

  return result.rows.map((row) => ({
    ...row,
    score_average: parseNumeric(row.score_average),
  }));
}

export async function getInstitutionById(id: number) {
  const result = await db.query<Institution>(
    `SELECT id_institution, name_institution, score_average
     FROM institution
     WHERE id_institution = $1`,
    [id]
  );

  const institution = result.rows.at(0);

  if (!institution) return null;

  return {
    ...institution,
    score_average: parseNumeric(institution.score_average),
  };
}

export async function createInstitution(payload: { name: string; scoreAverage?: number | null }) {
  const result = await db.query<Institution>(
    `INSERT INTO institution (name_institution, score_average)
     VALUES ($1, $2)
     RETURNING id_institution, name_institution, score_average`,
    [payload.name, payload.scoreAverage ?? null]
  );

  const created = result.rows[0];
  return {
    ...created,
    score_average: parseNumeric(created.score_average),
  };
}
