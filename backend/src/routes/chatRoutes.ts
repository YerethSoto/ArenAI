import { Router } from 'express';
import { chatService } from '../services/chatService.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const { user1Id, user2Id } = req.body;
        const id = await chatService.createChat(user1Id, user2Id);
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/between/:user1Id/:user2Id', async (req, res, next) => {
    try {
        const chat = await chatService.getChatBetweenUsers(Number(req.params.user1Id), Number(req.params.user2Id));
        res.json(chat || { found: false });
    } catch (err) {
        next(err);
    }
});

router.get('/user/:userId', async (req, res, next) => {
    try {
        const chats = await chatService.getUserChats(Number(req.params.userId));
        res.json(chats);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/messages', async (req, res, next) => {
    try {
        const id = await chatService.sendMessage({ ...req.body, chatId: Number(req.params.id) });
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.get('/:id/messages', async (req, res, next) => {
    try {
        const messages = await chatService.getMessages(Number(req.params.id));
        res.json(messages);
    } catch (err) {
        next(err);
    }
});

export default router;
