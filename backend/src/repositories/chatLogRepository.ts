import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../db/pool.js';

// Default class ID for all chats (until class system is implemented)
const DEFAULT_CLASS_ID = 1;

// Interface for chat history entries (learning_chat_history table)
export interface ChatMessage extends RowDataPacket {
    id_message: number;
    id_user: number;
    id_subject: number;
    id_class: number | null;
    role: 'user' | 'model';
    content: string;
    is_analyzed: boolean;
    created_at: Date;
}

/**
 * Log a chat message to learning_chat_history table
 * Async fire-and-forget pattern - doesn't block the response
 */
export async function logChatMessage(params: {
    userId: number;
    subjectId: number;
    classId?: number | null;
    role: 'user' | 'model';
    content: string;
}): Promise<void> {
    try {
        const classId = params.classId ?? DEFAULT_CLASS_ID;
        await db.query<ResultSetHeader>(
            `INSERT INTO learning_chat_history (id_user, id_subject, id_class, role, content, is_analyzed) 
             VALUES (?, ?, ?, ?, ?, 0)`,
            [params.userId, params.subjectId, classId, params.role, params.content]
        );
    } catch (err) {
        console.error('[ChatLog] Failed to log message:', err);
        // Don't throw - this is fire-and-forget
    }
}

/**
 * Get distinct users who have unanalyzed messages
 */
export async function getUsersWithUnanalyzedMessages(): Promise<number[]> {
    const result = await db.query<RowDataPacket>(
        `SELECT DISTINCT id_user FROM learning_chat_history WHERE is_analyzed = FALSE`
    );
    return result.rows.map((row: any) => row.id_user);
}

/**
 * Fetch unanalyzed messages for a specific user, grouped by class
 */
export async function getUnanalyzedMessagesByUser(userId: number): Promise<ChatMessage[]> {
    const result = await db.query<ChatMessage>(
        `SELECT * FROM learning_chat_history 
         WHERE id_user = ? AND is_analyzed = FALSE 
         ORDER BY id_class, created_at ASC`,
        [userId]
    );
    return result.rows;
}

/**
 * Mark specific messages as analyzed
 */
export async function markMessagesAsAnalyzed(messageIds: number[]): Promise<void> {
    if (messageIds.length === 0) return;
    
    const placeholders = messageIds.map(() => '?').join(',');
    await db.query<ResultSetHeader>(
        `UPDATE learning_chat_history SET is_analyzed = TRUE WHERE id_message IN (${placeholders})`,
        messageIds
    );
}

/**
 * Get subject name by ID for prompt context
 */
export async function getSubjectNameById(subjectId: number): Promise<string | null> {
    const result = await db.query<RowDataPacket>(
        `SELECT name_subject FROM subject WHERE id_subject = ?`,
        [subjectId]
    );
    return result.rows[0]?.name_subject || null;
}

/**
 * Get chat history for a user, optionally filtered by subject
 * Used to load conversation when chatbot opens
 */
export async function getChatHistory(params: {
    userId: number;
    subjectId?: number | null;
    classId?: number | null;
    limit?: number;
}): Promise<ChatMessage[]> {
    const limit = params.limit || 50; // Default to last 50 messages
    
    let query = `
        SELECT * FROM learning_chat_history 
        WHERE id_user = ?
    `;
    const queryParams: any[] = [params.userId];

    if (params.subjectId !== undefined && params.subjectId !== null) {
        query += ` AND id_subject = ?`;
        queryParams.push(params.subjectId);
    }

    if (params.classId !== undefined && params.classId !== null) {
        query += ` AND id_class = ?`;
        queryParams.push(params.classId);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    queryParams.push(limit);

    const result = await db.query<ChatMessage>(query, queryParams);
    
    // Return in chronological order (oldest first)
    return result.rows.reverse();
}

/**
 * Get subject ID by name
 */
export async function getSubjectIdByName(name: string): Promise<number | null> {
    const result = await db.query<RowDataPacket>(
        `SELECT id_subject FROM subject WHERE name_subject = ? LIMIT 1`,
        [name]
    );
    return result.rows[0]?.id_subject || null;
}
