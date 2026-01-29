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
  profile_picture_name: string | null;
  first_login: boolean;
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
        u.profile_picture_name,
        u.first_login,
        i.name_institution AS institution_name
       FROM \`user\` u
       LEFT JOIN institution i ON i.id_institution = u.id_institution
      WHERE u.username = ? OR u.email = ?
      LIMIT 1`,
    [identifier, identifier]
  );

  return result.rows.at(0) ?? null;
}

export async function findUserByUsername(username: string) {
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
        u.profile_picture_name,
        u.first_login,
        i.name_institution AS institution_name
       FROM \`user\` u
       LEFT JOIN institution i ON i.id_institution = u.id_institution
      WHERE u.username = ?
      LIMIT 1`,
    [username]
  );

  return result.rows.at(0) ?? null;
}

export async function createUser(payload: {
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  lastName?: string | null;
  phoneNumber?: string | null;
  idInstitution?: number | null;
  role?: string | null;
}) {
  const client = await db.getClient();

  try {
    await client.beginTransaction();

    const insertSql = `INSERT INTO \`user\` (username, email, password_hash, name, last_name, phone_number, id_institution, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const insertResult = await client.query<any>(insertSql, [
      payload.username,
      payload.email,
      payload.passwordHash,
      payload.name,
      payload.lastName ?? null,
      payload.phoneNumber ?? null,
      payload.idInstitution ?? null,
      payload.role ?? null,
    ]);

    const insertId = (insertResult.rows[0] as any).insertId;

    // If role is professor, create professor_profile record (minimal)
    if (payload.role === 'professor') {
      await client.query(`INSERT INTO professor_profile (id_user) VALUES (?)`, [insertId]);
    }

    await client.commit();

    // Load and return created user record
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
        WHERE u.id_user = ?
        LIMIT 1`,
      [insertId]
    );

    return result.rows.at(0) ?? null;
  } catch (err) {
    await client.rollback();
    throw err;
  } finally {
    client.release();
  }
}

export async function updateUser(idUser: number, data: Partial<{
  first_login: boolean;
  name: string;
  last_name: string;
  email: string;
  profile_picture_name: string;
}>) {
  if (Object.keys(data).length === 0) return false;

  const setClauses: string[] = [];
  const values: any[] = [];

  if (data.first_login !== undefined) {
    setClauses.push('first_login = ?');
    values.push(data.first_login);
  }

  if (data.name !== undefined) {
    setClauses.push('name = ?');
    values.push(data.name);
  }

  if (data.last_name !== undefined) {
    setClauses.push('last_name = ?');
    values.push(data.last_name);
  }

  if (data.email !== undefined) {
    setClauses.push('email = ?');
    values.push(data.email);
  }

  if (data.profile_picture_name !== undefined) {
    setClauses.push('profile_picture_name = ?');
    values.push(data.profile_picture_name);
  }

  if (setClauses.length === 0) return false;

  values.push(idUser);

  const sql = `UPDATE \`user\` SET ${setClauses.join(', ')} WHERE id_user = ?`;

  const result = await db.query<any>(sql, values);
  return (result.rows[0] as any).affectedRows > 0;
}

export async function linkUserToSection(userId: number, sectionId: number, roleInSection: string) {
  const result = await db.query<any>(
    `INSERT INTO user_section (id_user, id_section, role_in_section) VALUES (?, ?, ?)`,
    [userId, sectionId, roleInSection]
  );
  return (result.rows[0] as any).affectedRows > 0;
}

export interface UserAvatar {
  id_user_avatar: number;
  id_user: number;
  avatar_type: string;
  nickname: string;
  friendship_level: number;
  is_current: boolean;
  created_at: string;
}

export async function createUserAvatar(payload: { idUser: number; avatarType: string; nickname?: string; isCurrent?: boolean }) {
  const result = await db.query<any>(
    `INSERT INTO user_avatar (id_user, avatar_type, nickname, is_current) VALUES (?, ?, ?, ?)`,
    [payload.idUser, payload.avatarType, payload.nickname ?? null, payload.isCurrent ? 1 : 0]
  );
  return (result.rows[0] as any).insertId;
}

export async function getUserAvatars(idUser: number) {
  const result = await db.query<UserAvatar>(
    `SELECT * FROM user_avatar WHERE id_user = ? ORDER BY is_current DESC, created_at DESC`,
    [idUser]
  );
  return result.rows;
}

export async function updateUserAvatar(idAvatar: number, updates: Partial<{ nickname: string; friendshipLevel: number; isCurrent: boolean }>) {
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.nickname !== undefined) {
    setClauses.push('nickname = ?');
    values.push(updates.nickname);
  }
  if (updates.friendshipLevel !== undefined) {
    setClauses.push('friendship_level = ?');
    values.push(updates.friendshipLevel);
  }
  if (updates.isCurrent !== undefined) {
    setClauses.push('is_current = ?');
    values.push(updates.isCurrent ? 1 : 0);
  }

  if (setClauses.length === 0) return false;
  values.push(idAvatar);

  const sql = `UPDATE user_avatar SET ${setClauses.join(', ')} WHERE id_user_avatar = ?`;
  const result = await db.query<any>(sql, values);
  return (result.rows[0] as any).affectedRows > 0;
}

export async function getUserGrade(userId: number): Promise<string | null> {
    const result = await db.query<{ grade: string }>(
        `SELECT s.grade 
         FROM user_section us 
         JOIN section s ON us.id_section = s.id_section 
         WHERE us.id_user = ? 
         LIMIT 1`,
        [userId]
    );
    return result.rows[0]?.grade || null;
}
