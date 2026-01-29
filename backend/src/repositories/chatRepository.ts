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
                WHEN c.id_user_1 = ? THEN u2.id_user
                ELSE u1.id_user
            END as other_user_id,
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
            c.friendship as is_friend,
            -- Get last message text
            (SELECT m.text FROM message m WHERE m.id_chat = c.id_chat ORDER BY m.date DESC LIMIT 1) as last_message,
            -- Get last message time
            (SELECT m.date FROM message m WHERE m.id_chat = c.id_chat ORDER BY m.date DESC LIMIT 1) as last_message_time,
            -- Count unread messages (messages from other user that are not read)
            (
                SELECT COUNT(*) FROM message m 
                WHERE m.id_chat = c.id_chat 
                AND m.id_user != ?
                AND (m.is_read = 0 OR m.is_read IS NULL)
            ) as unread_count
        FROM chat c
        LEFT JOIN user u1 ON c.id_user_1 = u1.id_user
        LEFT JOIN user u2 ON c.id_user_2 = u2.id_user
        WHERE c.id_user_1 = ? OR c.id_user_2 = ?
        ORDER BY last_message_time DESC
    `;

    // 6 parameters: 4 for CASE statements + 1 for unread count + 2 for WHERE clause - but we have 5 CASE + 1 unread = 6 total
    // Actually: userId appears 4 times in CASE, 1 time in unread, 2 times in WHERE = 7 times
    // No wait, let's count: id_user_1=? (1), id_user_1=? (2), id_user_1=? (3), id_user_1=? (4), id_user!=? (5), id_user_1=? (6), id_user_2=? (7)
    // But we removed 1 parameter from the subquery (the COALESCE used 2 params, now uses 1)
    // So: 4 CASE + 1 unread + 2 WHERE = 7 parameters now
    const { rows } = await db.query(sql, [userId, userId, userId, userId, userId, userId, userId]);

    // Transform to match frontend expectations
    return rows.map((row: any) => {
        let timeStr = 'Start chatting';
        if (row.last_message_time) {
            const msgDate = new Date(row.last_message_time);
            const now = new Date();
            const isToday = msgDate.toDateString() === now.toDateString();
            timeStr = isToday
                ? msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : msgDate.toLocaleDateString();
        }

        return {
            id: row.id,
            name: row.name || row.username || 'Unknown User',
            avatar: row.avatar ? `/assets/avatars/${row.avatar}` : 'https://ionicframework.com/docs/img/demos/avatar.svg',
            message: row.last_message || 'Start a conversation',
            time: timeStr,
            unread: row.unread_count || 0
        };
    });
}

export async function sendMessage(payload: {
    chatId: number;
    userId: number;
    text: string;
    date?: string | Date;
}) {
    const dateVal = payload.date ? new Date(payload.date) : new Date();

    const result = await db.query<ResultSetHeader>(
        `INSERT INTO message (id_chat, id_user, text, date) VALUES (?, ?, ?, ?)`,
        [payload.chatId, payload.userId, payload.text, dateVal]
    );
    return result.rows[0].insertId;
}

export async function getChatMessages(chatId: number) {
    const result = await db.query<Message>(
        `SELECT m.*, u.name as sender_name 
         FROM message m
         LEFT JOIN user u ON m.id_user = u.id_user
         WHERE m.id_chat = ? 
         ORDER BY m.date ASC`,
        [chatId]
    );
    return result.rows;
}

// Bulk save messages from frontend cache sync
export async function bulkSaveMessages(messages: {
    chatId: number;
    userId: number;
    text: string;
    timestamp: string | Date;
}[]) {
    if (messages.length === 0) return { inserted: 0 };

    let inserted = 0;
    for (const msg of messages) {
        const dateVal = new Date(msg.timestamp);

        // Check if message already exists (by chatId, userId, and timestamp within 1 second)
        const existing = await db.query(
            `SELECT id_message FROM message 
             WHERE id_chat = ? AND id_user = ? AND text = ? 
             AND ABS(TIMESTAMPDIFF(SECOND, date, ?)) < 2`,
            [msg.chatId, msg.userId, msg.text, dateVal]
        );

        if (existing.rows.length === 0) {
            await db.query<ResultSetHeader>(
                `INSERT INTO message (id_chat, id_user, text, date) VALUES (?, ?, ?, ?)`,
                [msg.chatId, msg.userId, msg.text, dateVal]
            );
            inserted++;
        }
    }

    return { inserted };
}

// Mark all messages from other users as read for a specific user viewing a chat
export async function markMessagesAsRead(chatId: number, userId: number) {
    // Mark messages as read where the message is NOT from this user (i.e., from the other person)
    await db.query(
        `UPDATE message 
         SET is_read = 1 
         WHERE id_chat = ? AND id_user != ? AND (is_read = 0 OR is_read IS NULL)`,
        [chatId, userId]
    );
}
