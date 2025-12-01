import type { ResultSetHeader } from 'mysql2';
import { db } from '../db/pool.js';
import type { Chat, Message } from '../types.js';

export async function createChat(user1Id: number, user2Id: number) {
    const result = await db.query<ResultSetHeader>(
        `INSERT INTO chat (id_user_1, id_user_2, friendship) VALUES (?, ?, ?)`,
        [user1Id, user2Id, false]
    );
    return result.rows[0].insertId;
}

export async function getChatBetweenUsers(user1Id: number, user2Id: number) {
    const result = await db.query<Chat>(
        `SELECT * FROM chat 
     WHERE (id_user_1 = ? AND id_user_2 = ?) OR (id_user_1 = ? AND id_user_2 = ?)
     LIMIT 1`,
        [user1Id, user2Id, user2Id, user1Id]
    );
    return result.rows.at(0) ?? null;
}

export async function getUserChats(userId: number) {
    const result = await db.query<Chat>(
        `SELECT * FROM chat WHERE id_user_1 = ? OR id_user_2 = ?`,
        [userId, userId]
    );
    return result.rows;
}

export async function sendMessage(payload: {
    chatId: number;
    userId: number;
    date?: string | Date;
}) {
    const dateVal = payload.date ? new Date(payload.date) : new Date();

    const result = await db.query<ResultSetHeader>(
        `INSERT INTO message (id_chat, id_user, date) VALUES (?, ?, ?)`,
        [payload.chatId, payload.userId, dateVal]
    );
    return result.rows[0].insertId;
}

export async function getChatMessages(chatId: number) {
    const result = await db.query<Message>(
        `SELECT * FROM message WHERE id_chat = ? ORDER BY date ASC`,
        [chatId]
    );
    return result.rows;
}
