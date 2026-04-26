import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { Message } from '../models/Message';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const customerPhone = req.body.customerInfo?.phone;
        let customer = await Customer.findOne({ phone: customerPhone });
        
        if (!customer && customerPhone) {
            customer = new Customer({
                name: req.body.customerInfo?.name || 'Unknown',
                phone: customerPhone,
                address: req.body.customerInfo?.address || '',
                orders: []
            });
        }
        
        // Create the order in the database
        const orderData = { ...req.body };
        if (customer) {
            orderData.customerId = customer._id;
        }

        const newOrder = new Order(orderData);
        let savedOrder = await newOrder.save();

        if (customer) {
            // @ts-ignore
            customer.orders.push(savedOrder._id);
            await customer.save();
        }

        // Prepare SMS to admin (or customer depending on preference)
        // Here we send it to an admin number, or customer number
        const smsPhone = savedOrder.customerInfo?.phone;
        
        // MIMSMS Integration
        const apiKey = process.env.MIMSMS_API_KEY;
        const senderId = process.env.MIMSMS_SENDER_ID;
        
        // Check for valid credentials (not placeholder values)
        const isValidCredentials = apiKey && senderId && 
            apiKey !== 'your_mimsms_api_key_here' && 
            senderId !== 'your_sender_id_here' &&
            smsPhone && smsPhone !== 'N/A';
        
        if (isValidCredentials) {
            const smsMessage = `Thank you for your order! Your order (Total: $${savedOrder.total}) has been received by Craving Insights.`;
            let smsSuccess = false;
            
            try {
                // According to MimSMS documentation
                const response = await axios.post('https://api.mimsms.com/api/sendsms/vr2', {
                    api_key: apiKey,
                    senderid: senderId,
                    number: smsPhone,
                    text: smsMessage
                });
                console.log('MimSMS Response:', response.data);
                savedOrder.smsStatus = 'sent';
                smsSuccess = true;
            } catch (smsError) {
                console.error('Failed to send SMS:', smsError);
                savedOrder.smsStatus = 'failed';
            }
            
            await Message.create({
                recipientNumber: smsPhone,
                messageContent: smsMessage,
                type: 'automatic',
                status: smsSuccess ? 'sent' : 'failed',
                relatedOrderId: savedOrder._id,
                relatedCustomerId: customer ? customer._id : undefined
            });
            
        } else {
            console.log('MimSMS credentials not configured or invalid. SMS not sent.');
            savedOrder.smsStatus = 'pending';
            
            const smsMessage = `Thank you for your order! Your order (Total: $${savedOrder.total}) has been received by Craving Insights.`;
            await Message.create({
                recipientNumber: smsPhone || 'Unknown',
                messageContent: smsMessage,
                type: 'automatic',
                status: 'pending',
                relatedOrderId: savedOrder._id,
                relatedCustomerId: customer ? customer._id : undefined
            });
        }
        await savedOrder.save();


        res.status(201).json({ message: 'Order placed successfully', orderId: savedOrder._id });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (typeof id !== 'string') {
            return res.status(400).json({ message: "Invalid order ID" });
        }
        let order;

        // If ID is 6 characters, search by the end of the ObjectId
        if (id.length === 6) {
            order = await Order.findOne({
                $expr: {
                    $eq: [{ $substr: [{ $toString: "$_id" }, 18, 6] }, id.toLowerCase()]
                }
            });
        } else {
            // Otherwise try searching by full ID (standard MongoDB behavior)
            if (mongoose.Types.ObjectId.isValid(id)) {
                order = await Order.findById(id);
            }
        }

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order' });
    }
});

// Hold order endpoint
router.put('/:id/hold', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                isHeld: true, 
                heldAt: new Date(),
                status: 'held'
            },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to hold order' });
    }
});

// Release held order endpoint
router.put('/:id/release', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                isHeld: false, 
                heldAt: null,
                status: 'pending'
            },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to release order' });
    }
});

// Get held orders
router.get('/held/all', async (req, res) => {
    try {
        const heldOrders = await Order.find({ isHeld: true }).sort({ heldAt: -1 });
        res.json(heldOrders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch held orders' });
    }
});

// Split payment endpoint
router.post('/:id/split-payment', async (req, res) => {
    try {
        const { payments } = req.body; // Array of { method, amount, transactionId }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        
        // Update order with split payments
        order.splitPayments = payments;
        order.amountReceived = totalPaid;
        order.changeAmount = totalPaid - order.total;
        order.paymentMethod = 'split';
        
        if (totalPaid >= order.total) {
            order.status = 'completed';
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to process split payment' });
    }
});

// Process payment with change calculation
router.post('/:id/payment', async (req, res) => {
    try {
        const { paymentMethod, amountReceived } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentMethod = paymentMethod;
        order.amountReceived = amountReceived || order.total;
        order.changeAmount = order.amountReceived - order.total;
        
        if (order.amountReceived >= order.total) {
            order.status = 'completed';
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to process payment' });
    }
});

// Delete order endpoint
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete order' });
    }
});

export default router;
