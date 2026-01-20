import { db } from '../db/pool.js';
export async function findUserByIdentifier(identifier) {
    const result = await db.query(`SELECT
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
      LIMIT 1`, [identifier, identifier]);
    return result.rows.at(0) ?? null;
}
export async function findUserByUsername(username) {
    const result = await db.query(`SELECT
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
      LIMIT 1`, [username]);
    return result.rows.at(0) ?? null;
}
export async function createUser(payload) {
    const client = await db.getClient();
    try {
        await client.beginTransaction();
        const insertSql = `INSERT INTO \`user\` (username, email, password_hash, name, last_name, phone_number, id_institution, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const insertResult = await client.query(insertSql, [
            payload.username,
            payload.email,
            payload.passwordHash,
            payload.name,
            payload.lastName ?? null,
            payload.phoneNumber ?? null,
            payload.idInstitution ?? null,
            payload.role ?? null,
        ]);
        const insertId = insertResult.rows[0].insertId;
        // If role is professor, create professor_profile record (minimal)
        if (payload.role === 'professor') {
            await client.query(`INSERT INTO professor_profile (id_user) VALUES (?)`, [insertId]);
        }
        await client.commit();
        // Load and return created user record
        const result = await db.query(`SELECT
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
        LIMIT 1`, [insertId]);
        return result.rows.at(0) ?? null;
    }
    catch (err) {
        await client.rollback();
        throw err;
    }
    finally {
        client.release();
    }
}
export async function updateUser(idUser, data) {
    if (Object.keys(data).length === 0)
        return false;
    const setClauses = [];
    const values = [];
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
    if (setClauses.length === 0)
        return false;
    values.push(idUser);
    const sql = `UPDATE \`user\` SET ${setClauses.join(', ')} WHERE id_user = ?`;
    const result = await db.query(sql, values);
    return result.rows[0].affectedRows > 0;
}
export async function linkUserToSection(userId, sectionId, roleInSection) {
    const result = await db.query(`INSERT INTO user_section (id_user, id_section, role_in_section) VALUES (?, ?, ?)`, [userId, sectionId, roleInSection]);
    return result.rows[0].affectedRows > 0;
}
