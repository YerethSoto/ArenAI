import { Router } from 'express';
import { battleService } from '../services/battleService.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const id = await battleService.createBattle(req.body);
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const battle = await battleService.getBattleById(Number(req.params.id));
        if (!battle) {
            res.status(404).json({ error: 'Battle not found' });
            return;
        }
        res.json(battle);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/health', async (req, res, next) => {
    try {
        const { user1Health, user2Health } = req.body;
        await battleService.updateHealth(Number(req.params.id), user1Health, user2Health);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

router.patch('/:id/winner', async (req, res, next) => {
    try {
        const { winner } = req.body;
        await battleService.setWinner(Number(req.params.id), winner);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

router.post('/:id/questions', async (req, res, next) => {
    try {
        const id = await battleService.addQuestion({ ...req.body, battleId: Number(req.params.id) });
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id/questions', async (req, res, next) => {
    try {
        const questions = await battleService.getQuestions(Number(req.params.id));
        res.json(questions);
    } catch (err) {
        next(err);
    }
});

export default router;
