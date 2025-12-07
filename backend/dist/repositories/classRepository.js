import { db } from '../db/pool.js';
import { parseNumeric } from '../utils/transformers.js';
export async function listClasses(filters) {
    const conditions = [];
    const params = [];
    if (filters.subjectId) {
        conditions.push('c.id_subject = ?');
        params.push(filters.subjectId);
    }
    if (filters.sectionId) {
        conditions.push('c.id_section = ?');
        params.push(filters.sectionId);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(`SELECT
        c.id_class,
        c.id_professor,
        c.name_class,
        c.id_subject,
        c.id_section,
        c.fecha,
        c.ai_summary,
        c.current_questions_summary,
        c.score_average,
        subj.name_subject AS subject_name,
  sec.section_number AS section_name,
        sec.grade AS section_grade,
        inst.id_institution AS institution_id,
        inst.name_institution AS institution_name
     FROM class c
     INNER JOIN subject subj ON subj.id_subject = c.id_subject
     INNER JOIN section sec ON sec.id_section = c.id_section
     LEFT JOIN institution inst ON inst.id_institution = sec.id_institution
     ${whereClause}
     ORDER BY c.fecha DESC, c.id_class DESC`, params);
    return result.rows.map((row) => ({
        id: row.id_class,
        name: row.name_class,
        date: row.fecha,
        aiSummary: row.ai_summary,
        currentQuestionsSummary: row.current_questions_summary,
        scoreAverage: parseNumeric(row.score_average),
        subject: {
            id: row.id_subject,
            name: row.subject_name,
        },
        section: {
            id: row.id_section,
            name: row.section_name,
            grade: row.section_grade,
            institutionId: row.institution_id,
            institutionName: row.institution_name,
        },
    }));
}
export async function createClass(payload) {
    const insertResult = await db.query(`INSERT INTO class (name_class, id_subject, id_section, id_professor, fecha, ai_summary, current_questions_summary, score_average)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        payload.name,
        payload.subjectId,
        payload.sectionId,
        payload.professorId,
        payload.date ?? null,
        payload.aiSummary ?? null,
        payload.currentQuestionsSummary ?? null,
        payload.scoreAverage ?? null,
    ]);
    const created = await db.query(`SELECT id_class, name_class, id_subject, id_section, fecha, ai_summary, current_questions_summary, score_average
     FROM class
     WHERE id_class = ?`, [insertResult.rows[0].insertId]);
    return created.rows[0];
}
export async function assignTopicsToClass(classId, topics) {
    if (!topics.length)
        return;
    const client = await db.getClient();
    try {
        await client.beginTransaction();
        for (const { topicId, scoreAverage } of topics) {
            await client.query(`INSERT INTO class_topic (id_class, id_topic, score_average)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE score_average = VALUES(score_average)`, [classId, topicId, scoreAverage ?? null]);
        }
        await client.commit();
    }
    catch (error) {
        await client.rollback();
        throw error;
    }
    finally {
        client.release();
    }
}
export async function enrollStudentsInClass(classId, students) {
    if (!students.length)
        return;
    const client = await db.getClient();
    try {
        await client.beginTransaction();
        for (const student of students) {
            await client.query(`INSERT INTO class_student (id_class, id_user, ai_summary, interaction_coefficient, score_average, attendance)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           ai_summary = VALUES(ai_summary),
           interaction_coefficient = VALUES(interaction_coefficient),
           score_average = VALUES(score_average),
           attendance = VALUES(attendance)`, [
                classId,
                student.userId,
                student.aiSummary ?? null,
                student.interactionCoefficient ?? null,
                student.scoreAverage ?? null,
                student.attendance ?? false,
            ]);
        }
        await client.commit();
    }
    catch (error) {
        await client.rollback();
        throw error;
    }
    finally {
        client.release();
    }
}
export async function recordClassStudentTopicScores(classId, entries) {
    if (!entries.length)
        return;
    const client = await db.getClient();
    try {
        await client.beginTransaction();
        for (const entry of entries) {
            await client.query(`INSERT INTO class_student_topic (id_class, id_topic, id_user, score, ai_summary)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           score = VALUES(score),
           ai_summary = VALUES(ai_summary)`, [classId, entry.topicId, entry.userId, entry.score ?? null, entry.aiSummary ?? null]);
        }
        await client.commit();
    }
    catch (error) {
        await client.rollback();
        throw error;
    }
    finally {
        client.release();
    }
}
