import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../db/pool.js';

// Interface for quiz header
export interface Quiz {
    id_quiz: number;
    id_professor: number;
    id_subject: number;
    quiz_name: string;
    description: string | null;
    level: string;
    language: string | null;
    created_at: Date;
}

// Interface for quiz question matching schema
export interface QuizQuestion {
    id_question: number;
    id_quiz: number;
    id_topic: number | null;
    question_text: string;
    points: number;
    allow_multiple_selection: boolean;
    option_1: string;
    option_2: string;
    option_3: string | null;
    option_4: string | null;
    correct_options: string; // JSON string e.g. "[1]" or "[1,3]"
}

// Create a new quiz
export async function createQuiz(payload: {
    professorId: number;
    subjectId: number;
    name: string;
    description?: string;
    level: string;
    language?: string;
}): Promise<number> {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO quiz (id_professor, id_subject, quiz_name, description, level, language)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            payload.professorId,
            payload.subjectId,
            payload.name,
            payload.description || null,
            payload.level,
            payload.language || null,
        ]
    );
    return result.rows[0].insertId;
}

// Add a question to a quiz
export async function addQuestionToQuiz(payload: {
    quizId: number;
    topicId?: number | null;
    questionText: string;
    points?: number;
    allowMultiple?: boolean;
    option1: string;
    option2: string;
    option3?: string | null;
    option4?: string | null;
    correctOptions: string; // JSON string: "[1]" or "[1,2]"
}): Promise<number> {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO quiz_question
         (id_quiz, id_topic, question_text, points, allow_multiple_selection, option_1, option_2, option_3, option_4, correct_options)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            payload.quizId,
            payload.topicId || null,
            payload.questionText,
            payload.points ?? 1.00,
            payload.allowMultiple ?? false,
            payload.option1,
            payload.option2,
            payload.option3 || null,
            payload.option4 || null,
            payload.correctOptions,
        ]
    );
    return result.rows[0].insertId;
}

// Get a quiz by ID
export async function getQuizById(quizId: number): Promise<Quiz | null> {
    const result = await db.query<Quiz & RowDataPacket>(
        `SELECT * FROM quiz WHERE id_quiz = ?`,
        [quizId]
    );
    return result.rows.at(0) ?? null;
}

// List all quizzes by professor (with question count)
export async function listQuizzesByProfessor(professorId: number) {
    const result = await db.query<Quiz & { question_count: number } & RowDataPacket>(
        `SELECT q.*, 
         (SELECT COUNT(*) FROM quiz_question qq WHERE qq.id_quiz = q.id_quiz) as question_count
         FROM quiz q 
         WHERE q.id_professor = ? 
         ORDER BY q.created_at DESC`,
        [professorId]
    );
    return result.rows;
}

// List all quizzes from other professors (for Popular Quizzes section)
// Simply shows all quizzes NOT owned by the current professor
export async function listPublicQuizzes(excludeProfessorId?: number) {
    const result = await db.query<Quiz & { question_count: number; first_name: string; last_name: string } & RowDataPacket>(
        `SELECT q.id_quiz, q.id_professor, q.id_subject, q.quiz_name, q.description, q.level, q.language, q.created_at,
         u.name as first_name, u.last_name,
         (SELECT COUNT(*) FROM quiz_question qq WHERE qq.id_quiz = q.id_quiz) as question_count
         FROM quiz q 
         LEFT JOIN user u ON q.id_professor = u.id_user
         ${excludeProfessorId ? 'WHERE q.id_professor != ?' : ''}
         ORDER BY q.id_quiz DESC
         LIMIT 20`,
        excludeProfessorId ? [excludeProfessorId] : []
    );
    return result.rows;
}

// List all quizzes by subject
export async function listQuizzesBySubject(subjectId: number): Promise<Quiz[]> {
    const result = await db.query<Quiz & RowDataPacket>(
        `SELECT * FROM quiz WHERE id_subject = ? ORDER BY created_at DESC`,
        [subjectId]
    );
    return result.rows;
}

// Get questions for a quiz
export async function getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    const result = await db.query<QuizQuestion & RowDataPacket>(
        `SELECT * FROM quiz_question WHERE id_quiz = ?`,
        [quizId]
    );
    return result.rows;
}

// Delete a quiz (cascade deletes questions)
export async function deleteQuiz(quizId: number): Promise<boolean> {
    const result = await db.query<ResultSetHeader>(
        `DELETE FROM quiz WHERE id_quiz = ?`,
        [quizId]
    );
    return result.rows[0].affectedRows > 0;
}

// Get quiz count for a professor
export async function getQuizCountByProfessor(professorId: number): Promise<number> {
    const result = await db.query<{ count: number } & RowDataPacket>(
        `SELECT COUNT(*) as count FROM quiz WHERE id_professor = ?`,
        [professorId]
    );
    return result.rows[0]?.count ?? 0;
}

// Full quiz with questions (for retrieving saved quiz)
export async function getFullQuiz(quizId: number) {
    const quiz = await getQuizById(quizId);
    if (!quiz) return null;
    const questions = await getQuizQuestions(quizId);
    return { ...quiz, questions };
}

// Rate a quiz (upsert - insert or update existing rating)
export async function rateQuiz(quizId: number, userId: number, rating: number) {
    // Insert or update rating
    await db.query<ResultSetHeader>(
        `INSERT INTO quiz_rating (id_quiz, id_user, rating)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
        [quizId, userId, rating]
    );

    // Recalculate average rating for the quiz
    const avgResult = await db.query<{ avg_rating: number; rating_count: number } & RowDataPacket>(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count FROM quiz_rating WHERE id_quiz = ?`,
        [quizId]
    );

    const avgRating = Math.round((avgResult.rows[0]?.avg_rating || 0) * 10) / 10;
    const ratingCount = avgResult.rows[0]?.rating_count || 0;

    // Update quiz with new average
    await db.query<ResultSetHeader>(
        `UPDATE quiz SET avg_rating = ?, rating_count = ? WHERE id_quiz = ?`,
        [avgRating, ratingCount, quizId]
    );

    return { avgRating, ratingCount };
}

// Increment download count for a quiz
export async function incrementDownloads(quizId: number) {
    await db.query<ResultSetHeader>(
        `UPDATE quiz SET downloads = downloads + 1 WHERE id_quiz = ?`,
        [quizId]
    );
}

// Copy a quiz to user's library (for "Add to My Quizzes" feature)
// Tracks the original creator for credit
export async function copyQuizToLibrary(quizId: number, newProfessorId: number) {
    // Get original quiz
    const original = await getFullQuiz(quizId);
    if (!original) return null;

    // Get original creator name for credit
    const creatorResult = await db.query<{ name: string; last_name: string } & RowDataPacket>(
        `SELECT name, last_name FROM user WHERE id_user = ?`,
        [original.id_professor]
    );
    const originalCreator = creatorResult.rows[0];
    const creditText = originalCreator 
        ? `Original by: ${originalCreator.name || ''} ${originalCreator.last_name || ''}`.trim()
        : '';

    // Create new quiz with credit in description
    const newQuizId = await createQuiz({
        professorId: newProfessorId,
        subjectId: original.id_subject,
        name: original.quiz_name,
        description: original.description 
            ? `${original.description}\n\n${creditText}`
            : creditText,
        level: original.level,
        language: original.language || undefined,
    });

    // Copy all questions
    for (const q of original.questions) {
        await addQuestionToQuiz({
            quizId: newQuizId,
            topicId: q.id_topic,
            questionText: q.question_text,
            points: parseFloat(String(q.points)) || 1,
            allowMultiple: Boolean(q.allow_multiple_selection),
            option1: q.option_1,
            option2: q.option_2,
            option3: q.option_3,
            option4: q.option_4,
            correctOptions: q.correct_options,
        });
    }

    // Increment download count on original
    await incrementDownloads(quizId);

    return newQuizId;
}
