import { Router } from 'express';
import { z } from 'zod';
import { getStudentTopicProgress, upsertStudentTopicScore } from '../repositories/studentRepository.js';
import { parseNumeric } from '../utils/transformers.js';

const router = Router();

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

export const studentsRouter = router;
