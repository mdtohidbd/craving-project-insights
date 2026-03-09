import express from 'express';
import { Message } from '../models/Message';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const messages = await Message.find()
            .populate('relatedOrderId')
            .populate('relatedCustomerId')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

export default router;
