import { db } from '../db/pool.js';
export async function listSectionsByInstitution(institutionId) {
    const result = await db.query(`SELECT id_section, name, grade, id_institution
     FROM section
     WHERE id_institution = ?
     ORDER BY grade, name`, [institutionId]);
    return result.rows;
}
export async function createSection(payload) {
    const insertResult = await db.query(`INSERT INTO section (name, grade, id_institution)
     VALUES (?, ?, ?)`, [payload.name, payload.grade, payload.institutionId]);
    const newSection = await db.query(`SELECT id_section, name, grade, id_institution
     FROM section
     WHERE id_section = ?`, [insertResult.rows[0].insertId]);
    return newSection.rows[0];
}
