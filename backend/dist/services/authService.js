import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { appConfig } from '../config/env.js';
export function signAccessToken({ userId, username, role }) {
    const payload = {
        sub: String(userId),
        username,
        role,
    };
    const signOptions = {
        expiresIn: appConfig.auth.jwtExpiresIn,
    };
    const token = jwt.sign(payload, appConfig.auth.jwtSecret, signOptions);
    return { token, expiresIn: appConfig.auth.jwtExpiresIn };
}
export async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
