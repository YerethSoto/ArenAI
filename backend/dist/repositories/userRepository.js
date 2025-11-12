import { db } from '../db/pool.js';
export async function findUserByIdentifier(identifier) {
    const result = await db.query(`SELECT id_user, username, email, password_hash, role, name, last_name
       FROM \`user\`
      WHERE username = ? OR email = ?
      LIMIT 1`, [identifier, identifier]);
    return result.rows.at(0) ?? null;
}
