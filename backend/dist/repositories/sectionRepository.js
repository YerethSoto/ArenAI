import { db } from '../db/pool.js';
export async function listSectionsByInstitution(institutionId) {
    const result = await db.query(`SELECT id_section, section_number, grade, id_institution
     FROM section
     WHERE id_institution = ?
     ORDER BY grade, section_number`, [institutionId]);
    return result.rows;
}
// List all sections (fallback when user has no institution)
export async function listAllSections() {
    const result = await db.query(`SELECT id_section, section_number, grade, id_institution
     FROM section
     ORDER BY grade, section_number
     LIMIT 100`);
    return result.rows;
}
export async function getSectionById(sectionId) {
    const result = await db.query(`SELECT id_section, section_number, grade, id_institution
     FROM section
     WHERE id_section = ?
     LIMIT 1`, [sectionId]);
    return result.rows.at(0) ?? null;
}
export async function createSection(payload) {
    const insertResult = await db.query(`INSERT INTO section (section_number, grade, id_institution)
     VALUES (?, ?, ?)`, [payload.sectionNumber, payload.grade, payload.institutionId]);
    const newSection = await db.query(`SELECT id_section, section_number, grade, id_institution
     FROM section
     WHERE id_section = ?`, [insertResult.rows[0].insertId]);
    return newSection.rows[0];
}
