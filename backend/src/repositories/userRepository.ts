import { db } from '../db/pool.js';

export interface UserRecord {
  id_user: number;
  username: string;
  email: string;
  password_hash: string;
  role: string | null;
  name: string;
  last_name: string | null;
  id_institution: number | null;
  institution_name: string | null;
}

export async function findUserByIdentifier(identifier: string) {
  const result = await db.query<UserRecord>(
    `SELECT
        u.id_user,
        u.username,
        u.email,
        u.password_hash,
        u.role,
        u.name,
        u.last_name,
        u.id_institution,
        i.name_institution AS institution_name
       FROM \`user\` u
       LEFT JOIN institution i ON i.id_institution = u.id_institution
      WHERE u.username = ? OR u.email = ?
      LIMIT 1`,
    [identifier, identifier]
  );

  return result.rows.at(0) ?? null;
}
