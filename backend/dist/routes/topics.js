import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler.js';
import { createTopicRelation, createTopicResource, listTopicResources } from '../repositories/topicRepository.js';
const router = Router();
router.post('/relations', async (req, res, next) => {
    const bodySchema = z.object({
        fatherId: z.number().int().positive(),
        sonId: z.number().int().positive(),
        correlation: z.number().min(0).max(1).optional(),
    });
    try {
        const body = bodySchema.parse(req.body);
        if (body.fatherId === body.sonId) {
            throw new ApiError(400, 'fatherId and sonId must be different');
        }
        const relation = await createTopicRelation(body);
        res.status(201).json(relation);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:topicId/resources', async (req, res, next) => {
    const paramsSchema = z.object({ topicId: z.coerce.number().int().positive() });
    try {
        const { topicId } = paramsSchema.parse(req.params);
        const resources = await listTopicResources(topicId);
        res.json(resources);
    }
    catch (error) {
        next(error);
    }
});
router.post('/:topicId/resources', async (req, res, next) => {
    const paramsSchema = z.object({ topicId: z.coerce.number().int().positive() });
    const bodySchema = z.object({
        source: z.string().url(),
        description: z.string().optional(),
        quality: z.number().min(0).max(100).optional(),
    });
    try {
        const { topicId } = paramsSchema.parse(req.params);
        const body = bodySchema.parse(req.body);
        const resource = await createTopicResource({
            topicId,
            source: body.source,
            description: body.description,
            quality: body.quality ?? null,
        });
        res.status(201).json(resource);
    }
    catch (error) {
        next(error);
    }
});
export const topicsRouter = router;
