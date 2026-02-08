import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../db/pool.js';

// Default class ID for all operations (until class system is implemented)
const DEFAULT_CLASS_ID = 1;

// Interface for student class summary (student_class_summary table)
export interface StudentClassSummary extends RowDataPacket {
    id_summary: number;
    id_class: number;
    id_user: number;
    summary_text: string;
    strengths: string[] | null;
    weaknesses: string[] | null;
    study_tips: string[] | null;
    is_processed_for_professor: boolean;
    created_at: Date;
    updated_at: Date;
}

// Interface for professor class reports
export interface ProfessorClassReport extends RowDataPacket {
    id_report: number;
    id_class: number;
    general_summary: string;
    top_confusion_topics: { topic: string; count: number }[] | null;
    sentiment_average: string | null;
    suggested_action: string | null;
    created_at: Date;
}

/**
 * Save or update a student class summary (UPSERT behavior)
 * Uses the UNIQUE constraint on (id_class, id_user) for upsert
 */
export async function saveStudentClassSummary(params: {
    userId: number;
    classId?: number;
    summaryText: string;
    strengths: string[];
    weaknesses: string[];
    studyTips: string[];
}): Promise<number> {
    const classId = params.classId ?? DEFAULT_CLASS_ID;
    
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO student_class_summary 
         (id_class, id_user, summary_text, strengths, weaknesses, study_tips, is_processed_for_professor)
         VALUES (?, ?, ?, ?, ?, ?, FALSE)
         ON DUPLICATE KEY UPDATE 
            summary_text = VALUES(summary_text),
            strengths = VALUES(strengths),
            weaknesses = VALUES(weaknesses),
            study_tips = VALUES(study_tips),
            is_processed_for_professor = FALSE,
            updated_at = CURRENT_TIMESTAMP`,
        [
            classId,
            params.userId,
            params.summaryText,
            JSON.stringify(params.strengths),
            JSON.stringify(params.weaknesses),
            JSON.stringify(params.studyTips)
        ]
    );
    return result.rows[0].insertId || 0;
}

/**
 * Get unprocessed summaries for professor report generation
 */
export async function getUnprocessedSummaries(classId?: number): Promise<StudentClassSummary[]> {
    const targetClassId = classId ?? DEFAULT_CLASS_ID;
    
    const result = await db.query<StudentClassSummary>(`
        SELECT scs.*, u.name, u.last_name
        FROM student_class_summary scs
        JOIN user u ON scs.id_user = u.id_user
        WHERE scs.id_class = ? AND scs.is_processed_for_professor = FALSE
        ORDER BY scs.updated_at DESC
    `, [targetClassId]);
    
    return result.rows;
}

/**
 * Mark summaries as processed for professor report
 */
export async function markSummariesAsProcessed(summaryIds: number[]): Promise<void> {
    if (summaryIds.length === 0) return;
    
    const placeholders = summaryIds.map(() => '?').join(',');
    await db.query<ResultSetHeader>(
        `UPDATE student_class_summary SET is_processed_for_professor = TRUE WHERE id_summary IN (${placeholders})`,
        summaryIds
    );
}

/**
 * Get student's latest summary for display
 */
export async function getStudentSummary(userId: number, classId?: number): Promise<StudentClassSummary | null> {
    const targetClassId = classId ?? DEFAULT_CLASS_ID;
    
    const result = await db.query<StudentClassSummary>(`
        SELECT * FROM student_class_summary
        WHERE id_user = ? AND id_class = ?
        ORDER BY updated_at DESC
        LIMIT 1
    `, [userId, targetClassId]);
    
    return result.rows[0] || null;
}

/**
 * Get all summaries for a class (for teacher view)
 */
export async function getClassSummaries(classId?: number): Promise<StudentClassSummary[]> {
    const targetClassId = classId ?? DEFAULT_CLASS_ID;
    
    const result = await db.query<StudentClassSummary>(`
        SELECT scs.*, u.name, u.last_name, u.username
        FROM student_class_summary scs
        JOIN user u ON scs.id_user = u.id_user
        WHERE scs.id_class = ?
        ORDER BY scs.updated_at DESC
    `, [targetClassId]);
    
    return result.rows;
}

/**
 * Save a professor class report
 */
export async function saveProfessorClassReport(params: {
    classId?: number;
    generalSummary: string;
    topConfusionTopics: { topic: string; count: number }[];
    sentimentAverage: string;
    suggestedAction: string;
}): Promise<number> {
    const classId = params.classId ?? DEFAULT_CLASS_ID;
    
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO professor_class_report 
         (id_class, general_summary, top_confusion_topics, sentiment_average, suggested_action)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            general_summary = VALUES(general_summary),
            top_confusion_topics = VALUES(top_confusion_topics),
            sentiment_average = VALUES(sentiment_average),
            suggested_action = VALUES(suggested_action)`,
        [
            classId,
            params.generalSummary,
            JSON.stringify(params.topConfusionTopics),
            params.sentimentAverage,
            params.suggestedAction
        ]
    );
    return result.rows[0].insertId || 0;
}

/**
 * Get recent professor reports for a class
 */
export async function getProfessorReports(classId?: number, limit: number = 10): Promise<ProfessorClassReport[]> {
    const targetClassId = classId ?? DEFAULT_CLASS_ID;
    
    const result = await db.query<ProfessorClassReport>(`
        SELECT * FROM professor_class_report
        WHERE id_class = ?
        ORDER BY created_at DESC
        LIMIT ?
    `, [targetClassId, limit]);
    
    return result.rows;
}
