import mysql, { FieldPacket } from 'mysql2/promise';
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

type QueryExecutor = (sql: string, params: unknown[]) => Promise<[unknown, FieldPacket[]]>;

async function runQuery<T>(executor: QueryExecutor, sql: string, params: unknown[] = []) {
  const [rows] = await executor(sql, params);
  return {
    rows: Array.isArray(rows) ? (rows as T[]) : ([rows] as T[]),
  };
}

export const db = {
  query: <T>(sql: string, params: unknown[] = []) => runQuery<T>(pool.query.bind(pool), sql, params),
  getClient: async () => {
    const connection = await pool.getConnection();

    return {
      query: <T>(sql: string, params: unknown[] = []) => runQuery<T>(connection.query.bind(connection), sql, params),
      beginTransaction: () => connection.beginTransaction(),
      commit: () => connection.commit(),
      rollback: () => connection.rollback(),
      release: () => connection.release(),
    };
  },
  end: () => pool.end(),
};
