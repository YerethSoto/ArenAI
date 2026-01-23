import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { Assignment, AssignmentSubmission } from '../types.js';

export async function createAssignment(payload: {
    title?: string | null;
    description?: string | null;
    sectionId: number;
    professorId: number;
    subjectId: number;
    dueTime?: string | Date | null;
    quizId?: number | null;
    winBattleRequirement?: number | null;
    minBattleWins?: number | null;
}) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO assignment (title, description, id_section, id_professor, id_subject, due_time, id_quiz, win_battle_requirement, min_battle_wins)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            payload.title ?? 'Assignment',
            payload.description ?? null,
            payload.sectionId,
            payload.professorId,
            payload.subjectId,
            payload.dueTime ?? null,
            payload.quizId ?? null,
            payload.winBattleRequirement ?? null,
            payload.minBattleWins ?? 0,
        ]
    );
    return result.rows[0].insertId;
}

// List all assignments by professor
export async function listAssignmentsByProfessor(professorId: number) {
    const result = await db.query<Assignment>(
        `SELECT a.*, 
                q.quiz_name,
                s.name_subject as subject_name,
                (SELECT COUNT(*) FROM user_section us WHERE us.id_section = a.id_section) as section_students_total,
                (SELECT COUNT(*) FROM assignment_submission asub WHERE asub.id_assignment = a.id_assignment) as students_total,
                (SELECT COUNT(*) FROM assignment_submission asub WHERE asub.id_assignment = a.id_assignment AND asub.status = 'SUBMITTED') as students_completed
         FROM assignment a
         LEFT JOIN quiz q ON q.id_quiz = a.id_quiz
         LEFT JOIN subject s ON s.id_subject = a.id_subject
         WHERE a.id_professor = ? 
         ORDER BY a.created_at DESC`,
        [professorId]
    );
    return result.rows;
}

export async function getAssignmentById(assignmentId: number) {
    const result = await db.query<Assignment>(
        `SELECT * FROM assignment WHERE id_assignment = ?`,
        [assignmentId]
    );
    return result.rows.at(0) ?? null;
}

export async function listAssignmentsBySection(sectionId: number) {
    const result = await db.query<Assignment>(
        `SELECT * FROM assignment WHERE id_section = ? ORDER BY due_time ASC`,
        [sectionId]
    );
    return result.rows;
}

export async function assignToStudent(assignmentId: number, studentId: number) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO assignment_submission (id_assignment, id_student, status)
     VALUES (?, ?, 'NOT_STARTED')`,
        [assignmentId, studentId]
    );
    return result.rows[0].insertId;
}

export async function updateAssignmentStatus(submissionId: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED') {
    await db.query(
        `UPDATE assignment_submission 
     SET status = ? 
     WHERE id_submission = ?`,
        [status, submissionId]
    );
}

export async function getStudentAssignments(studentId: number) {
    const result = await db.query<any>(
        `SELECT a.id_assignment, a.title, a.description, a.due_time, a.id_subject, a.id_quiz, 
                a.win_battle_requirement, a.min_battle_wins,
                s.name_subject as subject_name,
                q.quiz_name,
                sub.id_submission, sub.status, sub.grade, sub.win_streak_achieved, 
                sub.text_response, sub.started_at, sub.submitted_at, sub.graded_at, sub.feedback,
                (SELECT COUNT(*) FROM quiz_question qq WHERE qq.id_quiz = a.id_quiz) as questions_count
     FROM assignment a
     JOIN user_section us ON us.id_section = a.id_section AND us.id_user = ?
     LEFT JOIN assignment_submission sub ON sub.id_assignment = a.id_assignment AND sub.id_student = us.id_user
     LEFT JOIN subject s ON s.id_subject = a.id_subject
     LEFT JOIN quiz q ON q.id_quiz = a.id_quiz
     ORDER BY a.due_time ASC`,
        [studentId]
    );
    return result.rows;
}

export async function deleteAssignment(assignmentId: number) {
    // First delete related submissions
    await db.query('DELETE FROM assignment_submission WHERE id_assignment = ?', [assignmentId]);
    // Then delete the assignment
    await db.query('DELETE FROM assignment WHERE id_assignment = ?', [assignmentId]);
}

export async function updateAssignment(assignmentId: number, payload: {
    title?: string;
    description?: string;
    sectionId: number;
    professorId: number;
    subjectId: number;
    dueTime?: string | Date | null;
    quizId?: number | null;
    winBattleRequirement?: number | null;
    minBattleWins?: number | null;
}) {
    await db.query(
        `UPDATE assignment 
         SET title = ?, description = ?, id_section = ?, id_subject = ?, due_time = ?, id_quiz = ?, win_battle_requirement = ?, min_battle_wins = ?
         WHERE id_assignment = ?`,
        [
            payload.title,
            payload.description,
            payload.sectionId,
            payload.subjectId,
            payload.dueTime,
            payload.quizId ?? null,
            payload.winBattleRequirement ?? null,
            payload.minBattleWins ?? 0,
            assignmentId
        ]
    );
}
