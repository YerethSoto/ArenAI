import { Router } from 'express';
import { institutionsRouter } from './institutions.js';
import { subjectsRouter } from './subjects.js';
import { topicsRouter } from './topics.js';
import { classesRouter } from './classes.js';
import { studentsRouter } from './students.js';

const router = Router();

router.use('/institutions', institutionsRouter);
router.use('/subjects', subjectsRouter);
router.use('/topics', topicsRouter);
router.use('/classes', classesRouter);
router.use('/students', studentsRouter);

export const apiRouter = router;
