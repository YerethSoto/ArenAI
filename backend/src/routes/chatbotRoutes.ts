import { Router } from 'express';
import { chatbotService } from '../services/chatbotService.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const { studentId, subjectId } = req.body;
        const id = await chatbotService.createSession(studentId, subjectId);
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const session = await chatbotService.getSession(Number(req.params.id));
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        res.json(session);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/messages', async (req, res, next) => {
    try {
        const id = await chatbotService.addMessage({ ...req.body, chatbotId: Number(req.params.id) });
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id/messages', async (req, res, next) => {
    try {
        const messages = await chatbotService.getMessages(Number(req.params.id));
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

export default router;
