import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const EnvSchema = z.object({
  PORT: z.string().optional().default('3000'),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform((val) => {
    const parsed = Number(val);
    if (Number.isNaN(parsed)) {
      throw new Error('DB_PORT must be a number');
    }
    return parsed;
  }),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_SSL: z
    .string()
    .optional()
    .transform((value) => value === 'true')
    .optional(),
});

const env = EnvSchema.parse(process.env);

export const appConfig = {
  port: Number(env.PORT),
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL ?? false,
  },
};
