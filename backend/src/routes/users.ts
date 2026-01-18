import { Router } from 'express';
import { z } from 'zod';
import { updateUser, findUserByIdentifier } from '../repositories/userRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
});

// Update user profile
router.put('/profile', async (req, res, next) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            throw new ApiError(401, 'Unauthorized');
        }

        const body = updateProfileSchema.parse(req.body);

        const updateData: any = {};
        if (body.name) updateData.name = body.name;
        if (body.lastName !== undefined) updateData.last_name = body.lastName;
        if (body.email) updateData.email = body.email;

        const updated = await updateUser(userId, updateData);

        if (!updated) {
            throw new ApiError(400, 'No changes made');
        }

        // Fetch updated user to return
        const updatedUser = await findUserByIdentifier(body.email || '');

        res.json({
            success: true,
            user: updatedUser ? {
                id: updatedUser.id_user,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                lastName: updatedUser.last_name,
                role: updatedUser.role,
            } : null
        });
    } catch (error) {
        next(error);
    }
});

// Get current user profile
router.get('/profile', async (req, res, next) => {
    try {
        const userId = (req as any).user?.userId;
        const username = (req as any).user?.username;

        if (!userId || !username) {
            throw new ApiError(401, 'Unauthorized');
        }

        const user = await findUserByIdentifier(username);

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        res.json({
            id: user.id_user,
            username: user.username,
            email: user.email,
            name: user.name,
            lastName: user.last_name,
            role: user.role,
            institution: user.id_institution ? {
                id: user.id_institution,
                name: user.institution_name,
            } : null,
        });
    } catch (error) {
        next(error);
    }
});

export const usersRouter = router;
