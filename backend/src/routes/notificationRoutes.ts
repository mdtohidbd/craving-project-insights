import express from 'express';
import Notification from '../models/Notification';

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark single notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// Mark all as read
router.patch('/read-all', async (req, res) => {
    try {
        const { ids } = req.body || {};
        if (ids && Array.isArray(ids) && ids.length > 0) {
            await Notification.updateMany({ _id: { $in: ids }, isRead: false }, { isRead: true });
        } else {
            await Notification.updateMany({ isRead: false }, { isRead: true });
        }
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification' });
    }
});

export default router;
