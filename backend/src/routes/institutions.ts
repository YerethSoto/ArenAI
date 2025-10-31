import { Router } from 'express';
import { z } from 'zod';
import { createInstitution, getInstitutionById, listInstitutions } from '../repositories/institutionRepository.js';
import { createSection, listSectionsByInstitution } from '../repositories/sectionRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const institutions = await listInstitutions();
    res.json(institutions);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const schema = z.object({
    name: z.string().min(1),
    scoreAverage: z.number().min(0).max(100).optional(),
  });

  try {
    const body = schema.parse(req.body);
    const institution = await createInstitution({
      name: body.name,
      scoreAverage: body.scoreAverage,
    });
    res.status(201).json(institution);
  } catch (error) {
    next(error);
  }
});

router.get('/:institutionId', async (req, res, next) => {
  const paramsSchema = z.object({ institutionId: z.coerce.number().int().positive() });

  try {
    const { institutionId } = paramsSchema.parse(req.params);
    const institution = await getInstitutionById(institutionId);

    if (!institution) {
      throw new ApiError(404, 'Institution not found');
    }

    res.json(institution);
  } catch (error) {
    next(error);
  }
});

router.get('/:institutionId/sections', async (req, res, next) => {
  const paramsSchema = z.object({ institutionId: z.coerce.number().int().positive() });

  try {
    const { institutionId } = paramsSchema.parse(req.params);

    const institution = await getInstitutionById(institutionId);
    if (!institution) {
      throw new ApiError(404, 'Institution not found');
    }

    const sections = await listSectionsByInstitution(institutionId);
    res.json(sections);
  } catch (error) {
    next(error);
  }
});

router.post('/:institutionId/sections', async (req, res, next) => {
  const paramsSchema = z.object({ institutionId: z.coerce.number().int().positive() });
  const bodySchema = z.object({
    name: z.string().min(1),
    grade: z.string().min(1),
  });

  try {
    const { institutionId } = paramsSchema.parse(req.params);
    const body = bodySchema.parse(req.body);

    const institution = await getInstitutionById(institutionId);
    if (!institution) {
      throw new ApiError(404, 'Institution not found');
    }

    const section = await createSection({
      name: body.name,
      grade: body.grade,
      institutionId,
    });

    res.status(201).json(section);
  } catch (error) {
    next(error);
  }
});

export const institutionsRouter = router;
