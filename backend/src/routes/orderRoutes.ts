import express from 'express';
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
        
        if (apiKey && senderId && smsPhone) {
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
            console.log('MimSMS credentials or customer phone missing. SMS not sent.');
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

export default router;
