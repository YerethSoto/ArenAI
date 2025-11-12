import mysql from 'mysql2/promise';
import { appConfig } from '../config/env.js';
const pool = mysql.createPool({
    host: appConfig.db.host,
    port: appConfig.db.port,
    database: appConfig.db.database,
    user: appConfig.db.user,
    password: appConfig.db.password,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
    ssl: appConfig.db.ssl
        ? {
            rejectUnauthorized: false,
        }
        : undefined,
});
async function runQuery(executor, sql, params = []) {
    const [rows] = await executor(sql, params);
    return {
        rows: Array.isArray(rows) ? rows : [rows],
    };
}
export const db = {
    query: (sql, params = []) => runQuery(pool.query.bind(pool), sql, params),
    getClient: async () => {
        const connection = await pool.getConnection();
        return {
            query: (sql, params = []) => runQuery(connection.query.bind(connection), sql, params),
            beginTransaction: () => connection.beginTransaction(),
            commit: () => connection.commit(),
            rollback: () => connection.rollback(),
            release: () => connection.release(),
        };
    },
    end: () => pool.end(),
};
