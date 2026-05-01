import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { Message } from '../models/Message';
import { DeliveryMan } from '../models/DeliveryMan';
import Notification from '../models/Notification';
import Table from '../models/Table';

const router = express.Router();

async function sendSmsHelper(phone: string, text: string, orderId: any, customerId?: any) {
    const apiKey = process.env.MIMSMS_API_KEY;
    const senderId = process.env.MIMSMS_SENDER_ID;
    
    const isValid = apiKey && senderId && 
        apiKey !== 'your_mimsms_api_key_here' && 
        senderId !== 'your_sender_id_here' &&
        phone && phone !== 'N/A';

    let status: 'sent' | 'failed' | 'pending' = 'pending';

    if (isValid) {
        try {
            const response = await axios.post('https://api.mimsms.com/api/sendsms/vr2', {
                api_key: apiKey,
                senderid: senderId,
                number: phone,
                text: text
            });
            console.log('MimSMS Response:', response.data);
            status = 'sent';
        } catch (error) {
            console.error('Failed to send SMS:', error);
            status = 'failed';
        }
    } else {
        console.log('MimSMS credentials not configured or invalid. SMS logged as pending.');
    }

    await Message.create({
        recipientNumber: phone,
        messageContent: text,
        type: 'automatic',
        status: status,
        relatedOrderId: orderId,
        relatedCustomerId: customerId
    });

    return status;
}

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
        console.log('Creating order with body:', JSON.stringify(req.body));
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

        // Handle table status update and availability check
        const tableId = req.body.tableId || savedOrder.tableId;
        if (tableId && savedOrder.orderType === 'dine-in') {
            console.log('Attempting to book table', tableId);
            // Atomically check if table is Free and mark it as Occupied
            const table = await Table.findOneAndUpdate(
                { _id: tableId, status: 'Free' },
                { 
                    status: 'Occupied',
                    currentOrder: savedOrder._id,
                    occupiedTime: new Date().toISOString()
                },
                { new: true }
            );

            if (!table) {
                // If update failed, check if table exists and why it failed
                const existingTable = await Table.findById(tableId);
                // Rollback order creation if table is not available
                await Order.findByIdAndDelete(savedOrder._id);
                
                if (!existingTable) {
                    return res.status(404).json({ message: 'Table not found' });
                }
                return res.status(400).json({ 
                    message: `Table ${existingTable.tableNumber} is already ${existingTable.status}. Please choose another table.` 
                });
            }
        }

        const formattedTotal = Number(savedOrder.total || 0).toFixed(2);
        
        // Handle SMS notifications based on order type
        if (savedOrder.orderType === 'online') {
            console.log('Online order detected. Delaying SMS until delivery man assignment.');
            savedOrder.smsStatus = 'pending';
        } else if (savedOrder.orderType === 'dine-in' || savedOrder.orderType === 'takeaway') {
            console.log(`${savedOrder.orderType} order detected. Skipping automatic SMS per request.`);
            savedOrder.smsStatus = 'pending';
        } else {
            // This handles any other non-online, non-dine-in, non-takeaway orders if they exist
            const smsMessage = `Thank you for your order! Your order (Total: ৳${formattedTotal}) has been received by Craving Insights.`;
            savedOrder.smsStatus = await sendSmsHelper(savedOrder.customerInfo?.phone || 'N/A', smsMessage, savedOrder._id, customer ? customer._id : undefined);
        }
        await savedOrder.save();

        // Create notification
        await Notification.create({
            type: 'order',
            title: 'New Order Received',
            message: `Order #${savedOrder._id.toString().slice(-6)}: ৳${formattedTotal}`,
        });

        res.status(201).json({ message: 'Order placed successfully', orderId: savedOrder._id });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

router.get('/', async (req, res) => {
    try {
        const filter: any = {};
        const { deliveryManId, orderType, deliveryStatus } = req.query;
        if (deliveryManId) filter.deliveryManId = deliveryManId;
        if (orderType)     filter.orderType     = orderType;
        if (deliveryStatus) filter.deliveryStatus = deliveryStatus;
        const orders = await Order.find(filter).sort({ createdAt: -1 });
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
        const oldOrder = await Order.findById(req.params.id);
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if deliveryManId is newly assigned
        if (req.body.deliveryManId && (!oldOrder || String(oldOrder.deliveryManId) !== String(req.body.deliveryManId))) {
            const deliveryMan = await DeliveryMan.findById(req.body.deliveryManId);
            if (deliveryMan && order.customerInfo) {
                const itemsSummary = order.items.map(i => `${i.quantity}x ${i.title}`).join(', ');

                // 1. Message to customer (Only for online/delivery orders)
                if (order.orderType !== 'dine-in' && order.orderType !== 'takeaway') {
                    const customerMessage = `Your order has been assigned to ${deliveryMan.name} (${deliveryMan.phone}). Total: ৳${order.total.toFixed(2)}. Items: ${itemsSummary}.`;
                    await sendSmsHelper(order.customerInfo.phone, customerMessage, order._id, order.customerId);
                }

                // 2. Message to delivery man
                const dmMessage = `New order assigned: ${order.customerInfo.name}, ৳${order.total.toFixed(2)}, ${order.customerInfo.address}. Items: ${itemsSummary}.`;
                await sendSmsHelper(deliveryMan.phone, dmMessage, order._id, order.customerId);

                if (deliveryMan.userId) {
                    await Notification.create({
                        type: 'order',
                        title: 'New Delivery Assigned',
                        message: `You have been assigned to deliver Order #${order._id.toString().slice(-6)} to ${order.customerInfo.name}.`,
                        targetUserId: deliveryMan.userId
                    });
                }
            }
        }

        // Handle table status update on completion
        if (req.body.status === 'completed' && (order.tableId || req.body.tableId) && order.orderType === 'dine-in') {
            const tableId = order.tableId || req.body.tableId;
            await Table.findByIdAndUpdate(tableId, {
                status: 'Cleaning'
            });
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

// Get served orders
router.get('/served/all', async (req, res) => {
    try {
        const servedOrders = await Order.find({ status: 'served' }).sort({ updatedAt: -1 });
        res.json(servedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch served orders' });
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

// Mark bill as printed
router.patch('/:id/print-bill', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { isBillPrinted: true },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark bill as printed' });
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
