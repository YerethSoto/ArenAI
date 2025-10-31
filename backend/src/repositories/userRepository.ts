import { db } from '../db/pool.js';

export interface UserRecord {
  id_user: number;
  username: string;
  email: string;
  password_hash: string;
  role: string | null;
  name: string;
  last_name: string | null;
}

export async function findUserByIdentifier(identifier: string) {
  const result = await db.query<UserRecord>(
    `SELECT id_user, username, email, password_hash, role, name, last_name
       FROM "user"
      WHERE username = $1 OR email = $1
      LIMIT 1`,
    [identifier]
  );

  return result.rows.at(0) ?? null;
}
