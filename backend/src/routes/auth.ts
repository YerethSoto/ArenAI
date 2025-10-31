import { Router } from 'express';
import { z } from 'zod';
import { findUserByIdentifier } from '../repositories/userRepository.js';
import { ApiError } from '../middleware/errorHandler.js';
import { signAccessToken, verifyPassword } from '../services/authService.js';

const router = Router();

const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    const user = await findUserByIdentifier(identifier);

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.password_hash);
    const matchesPlain = !isValid && user.password_hash === password;

    if (!isValid && !matchesPlain) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const { token, expiresIn } = signAccessToken({
      userId: user.id_user,
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      expiresIn,
      user: {
        id: user.id_user,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;
