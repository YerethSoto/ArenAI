import { Router } from 'express';
import { z } from 'zod';
import { createClass, assignTopicsToClass, enrollStudentsInClass, listClasses, recordClassStudentTopicScores } from '../repositories/classRepository.js';

const router = Router();

router.get('/', async (req, res, next) => {
  const querySchema = z.object({
    subjectId: z
      .union([z.coerce.number().int().positive(), z.undefined()])
      .optional()
      .transform((value) => (typeof value === 'number' ? value : undefined)),
    sectionId: z
      .union([z.coerce.number().int().positive(), z.undefined()])
      .optional()
      .transform((value) => (typeof value === 'number' ? value : undefined)),
    professorId: z
      .union([z.coerce.number().int().positive(), z.undefined()])
      .optional()
      .transform((value) => (typeof value === 'number' ? value : undefined)),
  });

  try {
    const filters = querySchema.parse({
      subjectId: req.query.subjectId,
      sectionId: req.query.sectionId,
      professorId: req.query.professorId,
    });

    const classes = await listClasses({
      subjectId: filters.subjectId,
      sectionId: filters.sectionId,
      professorId: filters.professorId,
    });

    res.json(classes);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const schema = z.object({
    professorId: z.number().int().positive(),
    name: z.string().min(1),
    subjectId: z.number().int().positive(),
    sectionId: z.number().int().positive(),
    date: z.string().optional(),
    aiSummary: z.string().optional(),
    currentQuestionsSummary: z.string().optional(),
    scoreAverage: z.number().min(0).max(100).optional(),
  });

  try {
    const body = schema.parse(req.body);
    const classRecord = await createClass({
      professorId: body.professorId,
      name: body.name,
      subjectId: body.subjectId,
      sectionId: body.sectionId,
      date: body.date ?? null,
      aiSummary: body.aiSummary ?? null,
      currentQuestionsSummary: body.currentQuestionsSummary ?? null,
      scoreAverage: body.scoreAverage ?? null,
    });

    res.status(201).json(classRecord);
  } catch (error) {
    next(error);
  }
});

router.post('/:classId/topics', async (req, res, next) => {
  const paramsSchema = z.object({ classId: z.coerce.number().int().positive() });
  const bodySchema = z.object({
    topics: z
      .array(
        z.object({
          topicId: z.number().int().positive(),
          scoreAverage: z.number().min(0).max(100).optional(),
        })
      )
      .min(1),
  });

  try {
    const { classId } = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    await assignTopicsToClass(
      classId,
      body.topics.map((topic) => ({
        topicId: topic.topicId,
        scoreAverage: topic.scoreAverage ?? null,
      }))
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:classId/students', async (req, res, next) => {
  const paramsSchema = z.object({ classId: z.coerce.number().int().positive() });
  const bodySchema = z.object({
    students: z
      .array(
        z.object({
          userId: z.number().int().positive(),
          interactionCoefficient: z.number().min(0).max(1).optional(),
          scoreAverage: z.number().min(0).max(100).optional(),
          aiSummary: z.string().optional(),
        })
      )
      .min(1),
  });

  try {
    const { classId } = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    await enrollStudentsInClass(
      classId,
      body.students.map((student) => ({
        userId: student.userId,
        interactionCoefficient: student.interactionCoefficient ?? null,
        scoreAverage: student.scoreAverage ?? null,
        aiSummary: student.aiSummary ?? null,
      }))
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:classId/topics/scores', async (req, res, next) => {
  const paramsSchema = z.object({ classId: z.coerce.number().int().positive() });
  const bodySchema = z.object({
    entries: z
      .array(
        z.object({
          userId: z.number().int().positive(),
          topicId: z.number().int().positive(),
          score: z.number().min(0).max(100).optional(),
          aiSummary: z.string().optional(),
        })
      )
      .min(1),
  });

  try {
    const { classId } = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    await recordClassStudentTopicScores(
      classId,
      body.entries.map((entry) => ({
        userId: entry.userId,
        topicId: entry.topicId,
        score: entry.score ?? null,
        aiSummary: entry.aiSummary ?? null,
      }))
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const classesRouter = router;
