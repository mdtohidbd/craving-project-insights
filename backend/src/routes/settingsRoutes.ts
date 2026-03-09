import express from 'express';
import Settings from '../models/Settings';

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ deliveryFee: 50, smsNumber: "+1 (555) 0123" });
        }
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Update settings
router.put('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            if (req.body.deliveryFee !== undefined) settings.deliveryFee = req.body.deliveryFee;
            if (req.body.adminPassword !== undefined) settings.adminPassword = req.body.adminPassword;
            if (req.body.smsNumber !== undefined) settings.smsNumber = req.body.smsNumber;
            await settings.save();
        }
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
