import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { Chatbot, ChatbotMessage } from '../types.js';

export async function createChatbotSession(studentId: number, subjectId: number | null) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO chatbot (id_student, id_subject) VALUES (?, ?)`,
        [studentId, subjectId]
    );
    return result.rows[0].insertId;
}

export async function getChatbotSession(sessionId: number) {
    const result = await db.query<Chatbot>(
        `SELECT * FROM chatbot WHERE id_chatbot = ?`,
        [sessionId]
    );
    return result.rows.at(0) ?? null;
}

export async function addChatbotMessage(payload: {
    chatbotId: number;
    isUser: boolean;
    date?: string | Date;
}) {
    const dateVal = payload.date ? new Date(payload.date) : new Date();

    const result = await db.query<ResultSetHeader>(
        `INSERT INTO chatbot_message (id_chatbot, is_user, date) VALUES (?, ?, ?)`,
        [payload.chatbotId, payload.isUser, dateVal]
    );
    return result.rows[0].insertId;
}

export async function getChatbotMessages(chatbotId: number) {
    const result = await db.query<ChatbotMessage>(
        `SELECT * FROM chatbot_message WHERE id_chatbot = ? ORDER BY date ASC`,
        [chatbotId]
    );
    return result.rows;
}
