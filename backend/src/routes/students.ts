import { Router } from 'express';
import { z } from 'zod';
import { getStudentTopicProgress, upsertStudentTopicScore, getStudentStats, getStudentSubjectScores } from '../repositories/studentRepository.js';
import { parseNumeric } from '../utils/transformers.js';

import { updateUser } from '../repositories/userRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

router.put('/:userId/onboarding', async (req, res, next) => {
  const paramsSchema = z.object({ userId: z.coerce.number().int().positive() });
  const bodySchema = z.object({
    first_login: z.boolean(),
  });

  try {
    const { userId } = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    // Authorization check
    // req.user is populated by requireAuth middleware
    const requestingUser = (req as any).user;
    if (!requestingUser || requestingUser.id !== userId) {
      throw new ApiError(403, 'Forbidden');
    }

    // Role check: Ensure this is only for students if strictness is desired
    // (Optional, but "handle in student only" implies student domain logic)

    const updateData: any = {};
    if (body.first_login !== undefined) {
      updateData.first_login = body.first_login;
    }

    await updateUser(userId, updateData);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/:userId/progress', async (req, res, next) => {
  const paramsSchema = z.object({ userId: z.coerce.number().int().positive() });

  try {
    const { userId } = paramsSchema.parse(req.params);
    const progress = await getStudentTopicProgress(userId);

    res.json(
      progress.map((row) => ({
        id_topic: row.id_topic,
        topic_name: row.topic_name,
        subject_name: row.subject_name,
        score: parseNumeric(row.score),
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/topics/:topicId/score', async (req, res, next) => {
  const paramsSchema = z.object({
    userId: z.coerce.number().int().positive(),
    topicId: z.coerce.number().int().positive(),
  });
  const bodySchema = z.object({
    score: z.number().min(0).max(100).nullable(),
  });

  try {
    const { userId, topicId } = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const updated = await upsertStudentTopicScore({
      userId,
      topicId,
      score: body.score,
    });

    if (!updated) {
      res.status(204).send();
      return;
    }

    res.json({
      id_topic: updated.id_topic,
      topic_name: updated.topic_name,
      subject_name: updated.subject_name,
      score: parseNumeric(updated.score),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/students/:userId/stats
 * Get aggregated stats for a student (quizzes, battles, rank)
 */
router.get('/:userId/stats', async (req, res, next) => {
  const paramsSchema = z.object({ userId: z.coerce.number().int().positive() });

  try {
    const { userId } = paramsSchema.parse(req.params);
    const stats = await getStudentStats(userId);

    res.json({
      quizzesCompleted: stats.quizzes_completed,
      quizAvgScore: stats.quiz_avg_score,
      battlesWon: stats.battles_won,
      totalBattles: stats.total_battles,
      classRank: stats.class_rank,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/students/:userId/subjects
 * Get subject scores for a student
 */
router.get('/:userId/subjects', async (req, res, next) => {
  const paramsSchema = z.object({ userId: z.coerce.number().int().positive() });

  try {
    const { userId } = paramsSchema.parse(req.params);
    const subjects = await getStudentSubjectScores(userId);

    res.json(subjects.map(s => ({
      subjectId: s.subject_id,
      subjectName: s.subject_name,
      score: s.score,
      color: s.color,
    })));
  } catch (error) {
    next(error);
  }
});

export const studentsRouter = router;

