import express from 'express';
import { DeliveryMan } from '../models/DeliveryMan';
import { Order } from '../models/Order';

import { User } from '../models/User';
import axios from 'axios';
import { Message } from '../models/Message';

const router = express.Router();

// Get delivery man profile for logged in user
router.get('/me', async (req, res) => {
    try {
        const userId = (req as any).query.userId; // Passed from frontend for simplicity or extracted from token
        if (!userId) return res.status(400).json({ message: 'User ID required' });
        
        const dm = await DeliveryMan.findOne({ userId });
        if (!dm) return res.status(404).json({ message: 'Deliveryman record not found' });
        
        res.json(dm);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// Get all delivery men (with live order counts)
router.get('/', async (req, res) => {
    try {
        // Auto-sync: Ensure all approved delivery staff have a DeliveryMan record
        const deliveryStaff = await User.find({ role: 'staff', staffRole: 'delivery', status: 'approved' });
        for (const staff of deliveryStaff) {
            const exists = await DeliveryMan.findOne({ userId: staff._id });
            if (!exists) {
                // Check if a DeliveryMan with the same phone exists (to avoid duplicate key errors)
                const phoneExists = await DeliveryMan.findOne({ phone: staff.phone });
                if (!phoneExists) {
                    await DeliveryMan.create({
                        name: staff.name,
                        phone: staff.phone,
                        email: staff.email,
                        userId: staff._id,
                        status: 'active'
                    });
                } else if (!phoneExists.userId) {
                    // Link existing record
                    phoneExists.userId = staff._id;
                    await phoneExists.save();
                }
            }
        }

        const deliveryMen = await DeliveryMan.find().sort({ name: 1 });
        // Attach active order count for each deliveryman
        const enriched = await Promise.all(deliveryMen.map(async (dm) => {
            const active = await Order.countDocuments({
                deliveryManId: dm._id,
                deliveryStatus: { $in: ['assigned', 'out_for_delivery'] },
            });
            const total = await Order.countDocuments({ deliveryManId: dm._id });
            return { ...dm.toObject(), activeOrders: active, totalOrders: total };
        }));
        res.json(enriched);
    } catch (error) {
        console.error("Fetch delivery men error:", error);
        res.status(500).json({ message: 'Failed to fetch delivery men' });
    }
});

// Create new delivery man (Unified with Staff Registration)
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, vehicleDetails, username, password } = req.body;

        // 1. Check if user already exists
        if (username) {
            const existingUser = await User.findOne({ username: username.toLowerCase() });
            if (existingUser) return res.status(409).json({ message: 'Username already taken.' });
        }

        const existingDM = await DeliveryMan.findOne({ phone });
        if (existingDM) return res.status(409).json({ message: 'A deliveryman with this phone number already exists.' });

        // 2. Create User account if credentials provided
        let userId = null;
        if (username && password) {
            const newUser = new User({
                name,
                username,
                phone,
                email: email || `${username}@craving.com`, // Fallback email
                password,
                role: 'staff',
                staffRole: 'delivery',
                status: 'approved',
                allowedModules: ['dashboard', 'delivery']
            });
            const savedUser = await newUser.save();
            userId = savedUser._id;
        }

        // 3. Create DeliveryMan record
        const deliveryMan = new DeliveryMan({
            name,
            phone,
            email,
            vehicleDetails,
            userId
        });
        await deliveryMan.save();

        res.status(201).json(deliveryMan);
    } catch (error: any) {
        console.error('Create deliveryman error:', error);
        res.status(500).json({ message: error.message || 'Failed to create delivery man' });
    }
});

// Toggle active/inactive status
router.patch('/:id/toggle-status', async (req, res) => {
    try {
        const dm = await DeliveryMan.findById(req.params.id);
        if (!dm) return res.status(404).json({ message: 'Delivery man not found' });
        
        dm.status = dm.status === 'active' ? 'inactive' : 'active';
        
        // Synchronize with User account status if exists
        if (dm.userId) {
            await User.findByIdAndUpdate(dm.userId, { 
                status: dm.status === 'active' ? 'approved' : 'rejected' 
            });
        }

        await dm.save();
        res.json(dm);
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle status' });
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
        const deliveryMan = await DeliveryMan.findById(req.params.id);
        if (!deliveryMan) return res.status(404).json({ message: 'Delivery man not found' });

        // If there's an associated user, delete it too
        if (deliveryMan.userId) {
            await User.findByIdAndDelete(deliveryMan.userId);
        }

        await DeliveryMan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Delivery man and associated account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete delivery man' });
    }
});

// Send custom SMS
router.post('/:id/message', async (req, res) => {
    try {
        const { message } = req.body;
        const deliveryMan = await DeliveryMan.findById(req.params.id);
        if (!deliveryMan) return res.status(404).json({ message: 'Delivery man not found' });

        const apiKey = process.env.MIMSMS_API_KEY;
        const senderId = process.env.MIMSMS_SENDER_ID;

        if (apiKey && senderId && deliveryMan.phone) {
            try {
                const response = await axios.post('https://api.mimsms.com/api/sendsms/vr2', {
                    api_key: apiKey,
                    senderid: senderId,
                    number: deliveryMan.phone,
                    text: message
                });
                
                await Message.create({
                    recipientNumber: deliveryMan.phone,
                    messageContent: message,
                    type: 'custom',
                    status: 'sent'
                });
                
                res.json({ message: 'SMS sent successfully', data: response.data });
            } catch (err) {
                console.error(err);
                await Message.create({
                    recipientNumber: deliveryMan.phone,
                    messageContent: message,
                    type: 'custom',
                    status: 'failed'
                });
                res.status(500).json({ message: 'Failed to send SMS' });
            }
        } else {
            res.status(400).json({ message: 'Missing SMS configuration or deliveryman phone' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

