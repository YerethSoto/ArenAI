import { Router } from 'express';
import { quizService } from '../services/quizService.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const id = await quizService.createQuiz(req.body);
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const quiz = await quizService.getQuizById(Number(req.params.id));
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        res.json(quiz);
    } catch (err) {
        next(err);
    }
});

router.get('/class/:classId', async (req, res, next) => {
    try {
        const quizzes = await quizService.listQuizzesByClass(Number(req.params.classId));
        res.json(quizzes);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/questions', async (req, res, next) => {
    try {
        const id = await quizService.addQuestion({ ...req.body, quizId: Number(req.params.id) });
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id/questions', async (req, res, next) => {
    try {
        const questions = await quizService.getQuestions(Number(req.params.id));
        res.json(questions);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/score', async (req, res, next) => {
    try {
        const id = await quizService.recordScore({ ...req.body, quizId: Number(req.params.id) });
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id/score/:studentId', async (req, res, next) => {
    try {
        const score = await quizService.getStudentScore(Number(req.params.id), Number(req.params.studentId));
        res.json(score || { score: null });
    } catch (err) {
        next(err);
    }
});

export default router;
