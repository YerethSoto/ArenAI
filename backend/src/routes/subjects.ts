import { Router } from 'express';
import { z } from 'zod';
import { createSubject, listSubjects } from '../repositories/subjectRepository.js';
import { createTopic, listTopicsBySubject } from '../repositories/topicRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const subjects = await listSubjects();
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const schema = z.object({ name: z.string().min(1) });

  try {
    const body = schema.parse(req.body);
    const subject = await createSubject({ name: body.name });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
});

router.get('/:subjectId/topics', async (req, res, next) => {
  const paramsSchema = z.object({ subjectId: z.coerce.number().int().positive() });

  try {
    const { subjectId } = paramsSchema.parse(req.params);
    const topics = await listTopicsBySubject(subjectId);
    res.json(topics);
  } catch (error) {
    next(error);
  }
});

router.post('/:subjectId/topics', async (req, res, next) => {
  const paramsSchema = z.object({ subjectId: z.coerce.number().int().positive() });
  const bodySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  });

  try {
    const { subjectId } = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);
    const topic = await createTopic({
      name: body.name,
      subjectId,
      description: body.description,
    });
    res.status(201).json(topic);
  } catch (error) {
    if ((error as Error).message.includes('unique')) {
      next(new ApiError(409, 'Topic name already exists for subject'));
      return;
    }
    next(error);
  }
});

export const subjectsRouter = router;
