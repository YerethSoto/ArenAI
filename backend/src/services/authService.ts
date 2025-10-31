import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { appConfig } from '../config/env.js';

export interface SignTokenPayload {
  userId: number;
  username: string;
  role: string | null;
}

export interface TokenResponse {
  token: string;
  expiresIn: string;
}

export function signAccessToken({ userId, username, role }: SignTokenPayload): TokenResponse {
  const token = jwt.sign(
    {
      sub: userId,
      username,
      role,
    },
    appConfig.auth.jwtSecret,
    {
      expiresIn: appConfig.auth.jwtExpiresIn,
    }
  );

  return { token, expiresIn: appConfig.auth.jwtExpiresIn };
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
