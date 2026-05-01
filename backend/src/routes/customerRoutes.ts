import express from 'express';
import axios from 'axios';
import { Customer } from '../models/Customer';
import { Message } from '../models/Message';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().populate('orders').sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
});

// Get a single customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).populate('orders');
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customer' });
    }
});

// Create a new customer
router.post('/', async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        
        // Basic validation
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Check if customer with same phone already exists
        if (phone) {
            const existingCustomer = await Customer.findOne({ phone });
            if (existingCustomer) {
                return res.status(400).json({ message: 'Customer with this phone number already exists' });
            }
        }

        const newCustomer = new Customer({
            name,
            phone: phone || 'N/A',
            address: address || 'N/A',
            orders: []
        });

        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        console.error('Create Customer Error:', error);
        res.status(500).json({ message: 'Failed to create customer' });
    }
});

// Send custom SMS
router.post('/:id/message', async (req, res) => {
    try {
        const { message } = req.body;
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const apiKey = process.env.MIMSMS_API_KEY;
        const senderId = process.env.MIMSMS_SENDER_ID;

        if (apiKey && senderId && customer.phone) {
            try {
                const response = await axios.post('https://api.mimsms.com/api/sendsms/vr2', {
                    api_key: apiKey,
                    senderid: senderId,
                    number: customer.phone,
                    text: message
                });
                
                await Message.create({
                    recipientNumber: customer.phone,
                    messageContent: message,
                    type: 'custom',
                    status: 'sent',
                    relatedCustomerId: customer._id
                });
                
                res.json({ message: 'SMS sent successfully', data: response.data });
            } catch (err) {
                console.error(err);
                await Message.create({
                    recipientNumber: customer.phone,
                    messageContent: message,
                    type: 'custom',
                    status: 'failed',
                    relatedCustomerId: customer._id
                });
                res.status(500).json({ message: 'Failed to send SMS' });
            }
        } else {
            res.status(400).json({ message: 'Missing SMS configuration or customer phone' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Send bulk SMS
router.post('/bulk-message', async (req, res) => {
    try {
        const { message, customerIds } = req.body;
        
        if (!Array.isArray(customerIds) || customerIds.length === 0) {
            return res.status(400).json({ message: 'No customers selected' });
        }

        const customers = await Customer.find({ _id: { $in: customerIds } });
        if (customers.length === 0) {
            return res.status(404).json({ message: 'No valid customers found' });
        }

        const apiKey = process.env.MIMSMS_API_KEY;
        const senderId = process.env.MIMSMS_SENDER_ID;

        if (!apiKey || !senderId) {
            return res.status(400).json({ message: 'Missing SMS configuration' });
        }

        // Send individually or bulk if API supports it. MimSMS supports comma separated numbers.
        // Let's gather all valid phones.
        const validCustomers = customers.filter(c => c.phone && c.phone !== 'N/A');
        
        if (validCustomers.length === 0) {
            return res.status(400).json({ message: 'Selected customers do not have valid phone numbers' });
        }

        const numbers = validCustomers.map(c => c.phone).join(',');

        try {
            const response = await axios.post('https://api.mimsms.com/api/sendsms/vr2', {
                api_key: apiKey,
                senderid: senderId,
                number: numbers,
                text: message
            });
            
            // Create message records
            const messageRecords = validCustomers.map(c => ({
                recipientNumber: c.phone,
                messageContent: message,
                type: 'custom',
                status: 'sent',
                relatedCustomerId: c._id
            }));
            await Message.insertMany(messageRecords);
            
            res.json({ message: 'Bulk SMS sent successfully', data: response.data, count: validCustomers.length });
        } catch (err) {
            console.error(err);
            const messageRecords = validCustomers.map(c => ({
                recipientNumber: c.phone,
                messageContent: message,
                type: 'custom',
                status: 'failed',
                relatedCustomerId: c._id
            }));
            await Message.insertMany(messageRecords);
            res.status(500).json({ message: 'Failed to send bulk SMS' });
        }
    } catch (error) {
        console.error('Bulk SMS Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
