import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { Assignment, AssignmentStudent } from '../types.js';

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
        `INSERT INTO assignment_student (id_assignment, id_student, complete)
     VALUES (?, ?, false)`,
        [assignmentId, studentId]
    );
    return result.rows[0].insertId;
}

export async function updateAssignmentCompletion(assignmentStudentId: number, complete: boolean, quizStudentId?: number | null) {
    await db.query(
        `UPDATE assignment_student 
     SET complete = ?, id_quiz_student = ? 
     WHERE id_assignment_student = ?`,
        [complete, quizStudentId ?? null, assignmentStudentId]
    );
}

export async function getStudentAssignments(studentId: number) {
    const result = await db.query<AssignmentStudent & { assignment_details: Assignment }>(
        `SELECT ast.*, a.id_section, a.due_time, a.id_quiz, a.win_battle_requirement, a.id_subject
     FROM assignment_student ast
     JOIN assignment a ON a.id_assignment = ast.id_assignment
     WHERE ast.id_student = ?`,
        [studentId]
    );
    return result.rows;
}
