import { db } from '../db/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface FriendRequestRow extends RowDataPacket {
  id_request: number;
  id_sender: number;
  id_receiver: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  updated_at: Date;
  sender_username?: string;
  sender_name?: string;
  sender_profile_picture?: string;
}

export interface UserSearchResult extends RowDataPacket {
  id_user: number;
  username: string;
  name: string | null;
  last_name: string | null;
  profile_picture_name: string | null;
}

export async function searchUsersNotFriends(query: string, currentUserId: number): Promise<UserSearchResult[]> {
  // Logic: Search users by username LIKE query
  // Exclude current user
  // Ideally, exclude existing friends or pending requests? 
  // For now, matching the previous logic: just simple search
  const sql = `
    SELECT id_user, username, name, last_name, profile_picture_name
    FROM \`user\` u
    WHERE username LIKE ? 
    AND id_user != ?
    LIMIT 10
  `;
  const { rows } = await db.query<UserSearchResult>(sql, [`%${query}%`, currentUserId]);
  return rows;
}

export async function findExistingRequest(userA: number, userB: number): Promise<FriendRequestRow | null> {
  const sql = `
    SELECT * FROM friend_requests 
    WHERE (id_sender = ? AND id_receiver = ?) 
       OR (id_sender = ? AND id_receiver = ?)
    LIMIT 1
  `;
  const { rows } = await db.query<FriendRequestRow>(sql, [userA, userB, userB, userA]);
  return rows.at(0) ?? null;
}

export async function createFriendRequest(senderId: number, receiverId: number): Promise<boolean> {
  const sql = `INSERT INTO friend_requests (id_sender, id_receiver) VALUES (?, ?)`;
  const { rows } = await db.query<ResultSetHeader>(sql, [senderId, receiverId]);
  return (rows as any).affectedRows > 0;
}

export async function getPendingRequests(receiverId: number): Promise<FriendRequestRow[]> {
  const sql = `
    SELECT fr.id_request, fr.id_sender, fr.created_at, fr.status,
           u.username as sender_username, u.name as sender_name, u.profile_picture_name as sender_profile_picture
    FROM friend_requests fr
    JOIN \`user\` u ON fr.id_sender = u.id_user
    WHERE fr.id_receiver = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `;
  const { rows } = await db.query<FriendRequestRow>(sql, [receiverId]);
  return rows;
}

export async function getRequestById(requestId: number): Promise<FriendRequestRow | null> {
  const sql = `SELECT * FROM friend_requests WHERE id_request = ?`;
  const { rows } = await db.query<FriendRequestRow>(sql, [requestId]);
  return rows.at(0) ?? null;
}

export async function updateRequestStatus(requestId: number, status: 'accepted' | 'rejected'): Promise<boolean> {
  const sql = `UPDATE friend_requests SET status = ? WHERE id_request = ?`;
  const { rows } = await db.query<ResultSetHeader>(sql, [status, requestId]);
  return (rows as any).affectedRows > 0;
}

export async function checkChatExists(user1: number, user2: number): Promise<boolean> {
    const sql = `SELECT id_chat FROM chat WHERE (id_user_1 = ? AND id_user_2 = ?) OR (id_user_1 = ? AND id_user_2 = ?) LIMIT 1`;
    const { rows } = await db.query<RowDataPacket>(sql, [user1, user2, user2, user1]);
    return rows.length > 0;
}

export async function createChat(user1: number, user2: number): Promise<number> {
    const sql = `INSERT INTO chat (id_user_1, id_user_2, friendship) VALUES (?, ?, 1)`;
    const { rows } = await db.query<ResultSetHeader>(sql, [user1, user2]);
    return (rows as any).insertId;
}
