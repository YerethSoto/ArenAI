import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../db/pool.js';

// Interface for chatbot session
export interface ChatbotSession extends RowDataPacket {
    id_chatbot: number;
    id_subject: number | null;
    id_student: number;
}

// Interface for chatbot message
export interface ChatbotMessage extends RowDataPacket {
    id_chatbot_message: number;
    id_chatbot: number;
    content: string;
    is_user: boolean;
    is_analyzed: boolean;
    created_at: Date;
}

/**
 * Get or create a chatbot session for a user + subject
 */
export async function getOrCreateChatbotSession(params: {
    userId: number;
    subjectId: number | null;
}): Promise<number> {
    // Try to find existing session
    const existing = await db.query<ChatbotSession>(
        `SELECT id_chatbot FROM chatbot 
         WHERE id_student = ? AND (id_subject = ? OR (id_subject IS NULL AND ? IS NULL))
         LIMIT 1`,
        [params.userId, params.subjectId, params.subjectId]
    );

    if (existing.rows[0]) {
        return existing.rows[0].id_chatbot;
    }

    // Create new session
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO chatbot (id_student, id_subject) VALUES (?, ?)`,
        [params.userId, params.subjectId]
    );
    
    console.log(`[ChatbotRepo] Created new session ${result.rows[0].insertId} for user ${params.userId}`);
    return result.rows[0].insertId;
}

/**
 * Save a chatbot message
 */
export async function saveChatbotMessage(params: {
    chatbotId: number;
    content: string;
    isUser: boolean;
}): Promise<number> {
    // Note: chatbot_message table has both 'content' and 'text' columns (both NOT NULL)
    // We populate both with the same value for compatibility
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO chatbot_message (id_chatbot, content, text, is_user, is_analyzed) 
         VALUES (?, ?, ?, ?, 0)`,
        [params.chatbotId, params.content, params.content, params.isUser ? 1 : 0]
    );
    return result.rows[0].insertId;
}

/**
 * Get chat history for a user's session with a subject
 */
export async function getChatbotHistory(params: {
    userId: number;
    subjectId: number | null;
    limit?: number;
}): Promise<ChatbotMessage[]> {
    const limit = params.limit || 50;

    const result = await db.query<ChatbotMessage>(`
        SELECT cm.* 
        FROM chatbot_message cm
        JOIN chatbot c ON cm.id_chatbot = c.id_chatbot
        WHERE c.id_student = ? 
          AND (c.id_subject = ? OR (c.id_subject IS NULL AND ? IS NULL))
        ORDER BY cm.created_at DESC
        LIMIT ?
    `, [params.userId, params.subjectId, params.subjectId, limit]);

    // Return in chronological order
    return result.rows.reverse();
}

/**
 * Get all chatbot sessions with unanalyzed messages
 */
export async function getSessionsWithUnanalyzedMessages(): Promise<Array<{
    chatbotId: number;
    userId: number;
    subjectId: number | null;
    subjectName: string | null;
}>> {
    const result = await db.query<RowDataPacket>(`
        SELECT DISTINCT 
            c.id_chatbot as chatbotId,
            c.id_student as userId,
            c.id_subject as subjectId,
            s.name_subject as subjectName
        FROM chatbot c
        JOIN chatbot_message cm ON cm.id_chatbot = c.id_chatbot
        LEFT JOIN subject s ON c.id_subject = s.id_subject
        WHERE cm.is_analyzed = 0
    `);
    return result.rows as any[];
}

/**
 * Get unanalyzed messages for a chatbot session
 */
export async function getUnanalyzedMessages(chatbotId: number): Promise<ChatbotMessage[]> {
    const result = await db.query<ChatbotMessage>(
        `SELECT * FROM chatbot_message 
         WHERE id_chatbot = ? AND is_analyzed = 0 
         ORDER BY created_at ASC`,
        [chatbotId]
    );
    return result.rows;
}

/**
 * Mark messages as analyzed
 */
export async function markMessagesAsAnalyzed(messageIds: number[]): Promise<void> {
    if (messageIds.length === 0) return;
    
    const placeholders = messageIds.map(() => '?').join(',');
    await db.query<ResultSetHeader>(
        `UPDATE chatbot_message SET is_analyzed = 1 WHERE id_chatbot_message IN (${placeholders})`,
        messageIds
    );
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
