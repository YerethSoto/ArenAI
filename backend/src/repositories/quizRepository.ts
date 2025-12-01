import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { Quiz, QuizQuestion, QuizStudent } from '../types.js';

export async function createQuiz(payload: {
    professorId: number | null;
    name: string | null;
    subjectId: number;
    sectionId: number;
    classId: number;
}) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO quiz (id_professor, quiz_name, id_subject, id_section, id_class)
     VALUES (?, ?, ?, ?, ?)`,
        [payload.professorId, payload.name, payload.subjectId, payload.sectionId, payload.classId]
    );
    return result.rows[0].insertId;
}

export async function getQuizById(quizId: number) {
    const result = await db.query<Quiz>(
        `SELECT * FROM quiz WHERE id_quiz = ?`,
        [quizId]
    );
    return result.rows.at(0) ?? null;
}

export async function listQuizzesByClass(classId: number) {
    const result = await db.query<Quiz>(
        `SELECT * FROM quiz WHERE id_class = ? ORDER BY id_quiz DESC`,
        [classId]
    );
    return result.rows;
}

export async function addQuestionToQuiz(payload: {
    quizId: number;
    topicId: number | null;
    question: string;
    answer1: string | null;
    answer2: string | null;
    answer3: string | null;
    answer4: string | null;
}) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO quiz_question (id_quiz, id_topic, question, answer1, answer2, answer3, answer4)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            payload.quizId,
            payload.topicId,
            payload.question,
            payload.answer1,
            payload.answer2,
            payload.answer3,
            payload.answer4,
        ]
    );
    return result.rows[0].insertId;
}

export async function getQuizQuestions(quizId: number) {
    const result = await db.query<QuizQuestion>(
        `SELECT * FROM quiz_question WHERE id_quiz = ?`,
        [quizId]
    );
    return result.rows;
}

export async function recordStudentQuizScore(payload: {
    quizId: number;
    studentId: number;
    score: number;
}) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO quiz_student (id_quiz, id_student, score)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE score = VALUES(score)`, // Assuming we want to update if exists, though no unique index on (quiz, student) was explicitly seen in schema, usually good practice. If no unique index, this might just insert.
        [payload.quizId, payload.studentId, payload.score]
    );
    return result.rows[0].insertId;
}

export async function getStudentQuizScore(quizId: number, studentId: number) {
    const result = await db.query<QuizStudent>(
        `SELECT * FROM quiz_student WHERE id_quiz = ? AND id_student = ?`,
        [quizId, studentId]
    );
    return result.rows.at(0) ?? null;
}
