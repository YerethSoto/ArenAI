import { Router } from 'express';
import { institutionsRouter } from './institutions.js';
import { subjectsRouter } from './subjects.js';
import { topicsRouter } from './topics.js';
import { classesRouter } from './classes.js';
import { studentsRouter } from './students.js';
import { sectionsRouter } from './sections.js';
import { authRouter } from './auth.js';
import quizRouter from './quizRoutes.js';
import battleRouter from './battleRoutes.js';
import chatRouter from './chatRoutes.js';
import chatbotRouter from './chatbotRoutes.js';
import assignmentRouter from './assignmentRoutes.js';
import friendRouter from './friendRoutes.js';
import leaderboardRouter from './leaderboardRoutes.js';
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
router.use('/quizzes', quizRouter);
router.use('/battles', battleRouter);
router.use('/chats', chatRouter);
router.use('/chatbot', chatbotRouter);
router.use('/assignments', assignmentRouter);
router.use('/friends', friendRouter);
router.use('/leaderboard', leaderboardRouter);

export const apiRouter = router;
