import { db } from '../db/pool.js';
import { parseNumeric } from '../utils/transformers.js';
export async function listInstitutions() {
    const result = await db.query(`SELECT id_institution, name_institution, score_average
     FROM institution
     ORDER BY name_institution`);
    return result.rows.map((row) => ({
        ...row,
        score_average: parseNumeric(row.score_average),
    }));
}
export async function findInstitutionByName(name) {
    const result = await db.query(`SELECT id_institution, name_institution, score_average
     FROM institution
     WHERE name_institution = ?
     LIMIT 1`, [name]);
    const institution = result.rows.at(0);
    if (!institution)
        return null;
    return {
        ...institution,
        score_average: parseNumeric(institution.score_average),
    };
}
export async function getInstitutionById(id) {
    const result = await db.query(`SELECT id_institution, name_institution, score_average
     FROM institution
     WHERE id_institution = ?`, [id]);
    const institution = result.rows.at(0);
    if (!institution)
        return null;
    return {
        ...institution,
        score_average: parseNumeric(institution.score_average),
    };
}
export async function createInstitution(payload) {
    const insertResult = await db.query(`INSERT INTO institution (name_institution, score_average)
     VALUES (?, ?)`, [payload.name, payload.scoreAverage ?? null]);
    const insertId = insertResult.rows[0].insertId;
    const created = await getInstitutionById(insertId);
    if (!created) {
        throw new Error('Failed to load institution after insert');
    }
    return created;
}
