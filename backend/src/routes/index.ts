import { Router } from 'express';
import { institutionsRouter } from './institutions.js';
import { subjectsRouter } from './subjects.js';
import { topicsRouter } from './topics.js';
import { classesRouter } from './classes.js';
import { studentsRouter } from './students.js';
import { sectionsRouter } from './sections.js';
import { authRouter } from './auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use(requireAuth);
router.use('/institutions', institutionsRouter);
router.use('/subjects', subjectsRouter);
router.use('/topics', topicsRouter);
router.use('/classes', classesRouter);
router.use('/students', studentsRouter);
router.use('/sections', sectionsRouter);

export const apiRouter = router;
