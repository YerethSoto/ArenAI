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
        const { userId, text, date } = req.body;
        const id = await chatService.sendMessage({
            chatId: Number(req.params.id),
            userId,
            text: text || '',
            date
        });
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

// Sync endpoint - bulk save messages from frontend localStorage
router.post('/:id/sync', async (req, res, next) => {
    try {
        const chatId = Number(req.params.id);
        const { messages } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages must be an array' });
        }

        // Map messages to include chatId
        const mappedMessages = messages.map((msg: any) => ({
            chatId,
            userId: msg.userId || msg.senderId,
            text: msg.text,
            timestamp: msg.timestamp
        }));

        const result = await chatService.bulkSaveMessages(mappedMessages);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
});

export default router;
