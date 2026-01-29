import { db } from '../db/pool.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// --- Interfaces ---
export interface QuizRow extends RowDataPacket {
    id_quiz: number;
    quiz_name: string;
    description: string | null;
    id_professor: number;
    id_subject: number;
    level: string;
    language: string | null;
    is_public: boolean;
    downloads: number;
    avg_rating: string | number;
    rating_count: number;
}

export interface QuestionRow extends RowDataPacket {
    id_question: number;
    question_text: string;
    option_1: string;
    option_2: string;
    option_3: string | null;
    option_4: string | null;
    correct_options: string;
    points: string | number;
    allow_multiple_selection: boolean;
    id_topic: number | null;
}

// --- QUIZ SELECTION FOR BATTLE (My Original Logic) ---

// --- QUIZ SELECTION FOR BATTLE (My Original Logic) ---

export async function getRandomQuiz(subjectName: string, grade: string, language?: string): Promise<QuizRow | null> {
    const result = await db.query<RowDataPacket>(
        'SELECT id_subject FROM subject WHERE name_subject = ?',
        [subjectName]
    );
    const subjects = result.rows;
    
    if (subjects.length === 0) return null;
    const subjectId = (subjects[0] as any).id_subject;

    // Build query with optional language filter
    let query = `SELECT * FROM quiz WHERE id_subject = ? AND level = ?`;
    const params: any[] = [subjectId, grade];
    
    if (language) {
        query += ` AND (language = ? OR language IS NULL)`;
        params.push(language);
    }
    
    query += ` ORDER BY RAND() LIMIT 1`;

    const quizResult = await db.query<QuizRow>(query, params);

    return quizResult.rows[0] || null;
}


export async function getQuizQuestions(quizId: number): Promise<any[]> {
    const result = await db.query<QuestionRow>(
        `SELECT *
         FROM quiz_question
         WHERE id_quiz = ?`,
        [quizId]
    );
    const questions = result.rows;

    // Map to frontend format
    return questions.map(q => ({
        id: q.id_question,
        question: q.question_text,
        options: [q.option_1, q.option_2, q.option_3, q.option_4].filter(Boolean),
        correctAnswer: parseCorrectAnswer(q.correct_options, [q.option_1, q.option_2, q.option_3, q.option_4].filter(Boolean))
    }));
}

function parseCorrectAnswer(correct: string, options: (string|null)[]): number {
    if (correct.toLowerCase() === 'option 1') return 0;
    if (correct.toLowerCase() === 'option 2') return 1;
    if (correct.toLowerCase() === 'option 3') return 2;
    if (correct.toLowerCase() === 'option 4') return 3;
    const idx = options.indexOf(correct);
    return idx !== -1 ? idx : 0;
}

// --- RESTORED METHODS FOR QUIZ SERVICE ---

export async function createQuiz(data: {
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
        [data.professorId, data.subjectId, data.name, data.description || null, data.level, data.language || 'en']
    );
    // Rows might be an array containing ResultSetHeader
    return (result.rows as any).insertId || (result.rows[0] as any).insertId; 
}

export async function addQuestionToQuiz(data: {
    quizId: number;
    topicId?: number | null;
    questionText: string;
    points?: number;
    allowMultiple?: boolean;
    option1: string;
    option2: string;
    option3?: string | null;
    option4?: string | null;
    correctOptions: string;
}): Promise<void> {
    await db.query(
        `INSERT INTO quiz_question (id_quiz, id_topic, question_text, points, allow_multiple_selection, option_1, option_2, option_3, option_4, correct_options)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.quizId, data.topicId || null, data.questionText, data.points || 1, data.allowMultiple ? 1 : 0, data.option1, data.option2, data.option3 || null, data.option4 || null, data.correctOptions]
    );
}

export async function getQuizById(quizId: number): Promise<QuizRow | null> {
    const result = await db.query<QuizRow>(
        `SELECT * FROM quiz WHERE id_quiz = ?`,
        [quizId]
    );
    return result.rows[0] || null;
}

export async function getFullQuiz(quizId: number) {
    const quiz = await getQuizById(quizId);
    if (!quiz) return null;
    
    // Helper to get raw questions
    const qResult = await db.query<QuestionRow>(
        `SELECT * FROM quiz_question WHERE id_quiz = ?`,
        [quizId]
    );
    
    return {
        ...quiz,
        questions: qResult.rows
    };
}

export async function listQuizzesByProfessor(professorId: number) {
    const result = await db.query<QuizRow>(
        `SELECT * FROM quiz WHERE id_professor = ? ORDER BY created_at DESC`,
        [professorId]
    );
    return result.rows;
}

export async function listPublicQuizzes(limit = 20, offset = 0) {
    const result = await db.query<QuizRow>(
        `SELECT * FROM quiz WHERE is_public = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    return result.rows;
}

export async function listQuizzesBySubject(subjectId: number) {
    const result = await db.query<QuizRow>(
        `SELECT * FROM quiz WHERE id_subject = ? AND is_public = 1 ORDER BY created_at DESC`,
        [subjectId]
    );
    return result.rows;
}

export async function deleteQuiz(quizId: number): Promise<boolean> {
    const result = await db.query<ResultSetHeader>(`DELETE FROM quiz WHERE id_quiz = ?`, [quizId]);
    return (result.rows as any).affectedRows > 0 || (result.rows[0] as any).affectedRows > 0;
}

export async function getQuizCountByProfessor(professorId: number): Promise<number> {
    const result = await db.query<RowDataPacket>(
        `SELECT COUNT(*) as count FROM quiz WHERE id_professor = ?`,
        [professorId]
    );
    return (result.rows[0] as any)?.count || 0;
}

export async function rateQuiz(quizId: number, userId: number, rating: number) {
    // Upsert rating
    await db.query(
        `INSERT INTO quiz_rating (id_quiz, id_user, rating) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
        [quizId, userId, rating]
    );
    
    // Update avg
    await db.query(`
        UPDATE quiz q 
        SET avg_rating = (SELECT AVG(rating) FROM quiz_rating WHERE id_quiz = q.id_quiz),
            rating_count = (SELECT COUNT(*) FROM quiz_rating WHERE id_quiz = q.id_quiz)
        WHERE id_quiz = ?
    `, [quizId]);
    
    return {}; // Return object to satisfy spread in routes
}

export async function incrementDownloads(quizId: number) {
    await db.query(`UPDATE quiz SET downloads = downloads + 1 WHERE id_quiz = ?`, [quizId]);
}

export async function copyQuizToLibrary(quizId: number, newProfessorId: number) {
    const original = await getFullQuiz(quizId);
    if (!original) throw new Error("Quiz not found");

    const newQuizId = await createQuiz({
        professorId: newProfessorId,
        subjectId: original.id_subject,
        name: original.quiz_name + " (Copy)",
        description: original.description || undefined,
        level: original.level,
        language: original.language || undefined
    });

    if (original.questions) {
        for (const q of (original as any).questions) {
             await addQuestionToQuiz({
                quizId: newQuizId,
                topicId: q.id_topic,
                questionText: q.question_text,
                points: Number(q.points),
                allowMultiple: Boolean(q.allow_multiple_selection),
                option1: q.option_1,
                option2: q.option_2,
                option3: q.option_3,
                option4: q.option_4,
                correctOptions: q.correct_options
            });
        }
    }
    
    return newQuizId;
}
