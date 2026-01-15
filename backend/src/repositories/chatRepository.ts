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
    const sql = `
        SELECT 
            c.id_chat as id,
            CASE 
                WHEN c.id_user_1 = ? THEN u2.name 
                ELSE u1.name 
            END as name,
            CASE 
                WHEN c.id_user_1 = ? THEN u2.username 
                ELSE u1.username 
            END as username,
            CASE 
                WHEN c.id_user_1 = ? THEN u2.profile_picture_name 
                ELSE u1.profile_picture_name 
            END as avatar,
            '' as message, -- Placeholder until message content is added
            c.friendship as is_friend,
            -- Mock time/unread for now since message table is incomplete
            'Just now' as time,
            0 as unread
        FROM chat c
        LEFT JOIN user u1 ON c.id_user_1 = u1.id_user
        LEFT JOIN user u2 ON c.id_user_2 = u2.id_user
        WHERE c.id_user_1 = ? OR c.id_user_2 = ?
    `;
    
    // We pass userId multiple times for the CASE statements and WHERE clause
    const { rows } = await db.query(sql, [userId, userId, userId, userId, userId]);
    
    // Transform to match frontend expectations
    return rows.map((row: any) => ({
        id: row.id,
        name: row.name || row.username || 'Unknown User',
        avatar: row.avatar ? `/assets/avatars/${row.avatar}` : 'https://ionicframework.com/docs/img/demos/avatar.svg', // Fallback or path
        message: row.message || 'Start a conversation',
        time: row.time,
        unread: row.unread
    }));
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
