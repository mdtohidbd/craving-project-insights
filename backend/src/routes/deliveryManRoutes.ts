import express from 'express';
import { DeliveryMan } from '../models/DeliveryMan';

const router = express.Router();

// Get all delivery men
router.get('/', async (req, res) => {
    try {
        const deliveryMen = await DeliveryMan.find().sort({ name: 1 });
        res.json(deliveryMen);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch delivery men' });
    }
});

// Create new delivery man
router.post('/', async (req, res) => {
    try {
        const deliveryMan = new DeliveryMan(req.body);
        await deliveryMan.save();
        res.status(201).json(deliveryMan);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create delivery man' });
    }
});

// Update delivery man
router.put('/:id', async (req, res) => {
    try {
        const deliveryMan = await DeliveryMan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!deliveryMan) return res.status(404).json({ message: 'Delivery man not found' });
        res.json(deliveryMan);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update delivery man' });
    }
});

// Delete delivery man
router.delete('/:id', async (req, res) => {
    try {
        const deliveryMan = await DeliveryMan.findByIdAndDelete(req.params.id);
        if (!deliveryMan) return res.status(404).json({ message: 'Delivery man not found' });
        res.json({ message: 'Delivery man deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete delivery man' });
    }
});

export default router;
