import { Router } from 'express';
import { z } from 'zod';
import { getLeaderboardBySection, getGlobalLeaderboard } from '../repositories/leaderboardRepository.js';

const router = Router();

/**
 * GET /api/leaderboard
 * Get leaderboard (optionally filtered by section)
 * Query params: sectionId (optional)
 */
router.get('/', async (req, res, next) => {
    const querySchema = z.object({
        sectionId: z
            .union([z.coerce.number().int().positive(), z.undefined()])
            .optional()
            .transform((value) => (typeof value === 'number' ? value : undefined)),
    });

    try {
        const { sectionId } = querySchema.parse({ sectionId: req.query.sectionId });

        let leaderboard;
        if (sectionId) {
            leaderboard = await getLeaderboardBySection(sectionId);
        } else {
            leaderboard = await getGlobalLeaderboard();
        }

        // Transform to frontend-friendly format
        const entries = leaderboard.map((entry, index) => ({
            id: entry.id_user,
            name: entry.name,
            avatar: entry.avatar || '👨‍🎓',
            stats: {
                arena: entry.arena_trophies,
                quiz: Math.round(entry.quiz_avg),
                utilization: Math.min(entry.quiz_count, 100),
            },
            totalScore: Math.round(entry.total_score),
        }));

        res.json(entries);
    } catch (error) {
        next(error);
    }
});

export default router;
