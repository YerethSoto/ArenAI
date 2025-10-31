import { Pool } from 'pg';
import { appConfig } from '../config/env.js';

const pool = new Pool({
  host: appConfig.db.host,
  port: appConfig.db.port,
  database: appConfig.db.database,
  user: appConfig.db.user,
  password: appConfig.db.password,
  ssl: appConfig.db.ssl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

export const db = {
  query: <T>(text: string, params: unknown[] = []) => pool.query<T>(text, params),
  getClient: () => pool.connect(),
  end: () => pool.end(),
};
