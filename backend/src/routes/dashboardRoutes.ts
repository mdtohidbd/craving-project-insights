import express from 'express';
import { Order } from '../models/Order';
import { InventoryItem } from '../models/InventoryItem';
import { Message } from '../models/Message';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // 1. Calculate Total Sales (completed orders or all paid orders)
        const completedOrders = await Order.find({ status: { $ne: 'cancelled' } });
        const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = completedOrders.length;
        
        // Calculate Today's Sales
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayOrders = completedOrders.filter(o => new Date(o.createdAt || new Date()) >= startOfToday);
        const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);

        // Calculate Monthly Sales
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthOrders = completedOrders.filter(o => new Date(o.createdAt || new Date()) >= startOfMonth);
        const monthlySales = monthOrders.reduce((sum, order) => sum + order.total, 0);
        
        // 2. Count Active Orders
        const activeOrders = await Order.countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] } });

        // 3. Count Low Stock Items
        const lowStockItems = await InventoryItem.countDocuments({ stock: { $lt: 20 } }); // Threshold: 20

        // 4. Sales Data for the last 7 days chart
        const salesData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dailyOrders = await Order.find({
                status: { $ne: 'cancelled' },
                createdAt: { $gte: date, $lt: nextDay }
            });
            
            const dailySales = dailyOrders.reduce((sum, order) => sum + order.total, 0);
            
            salesData.push({
                name: days[date.getDay()],
                sales: dailySales
            });
        }

        // 5. Inventory Data (get a few items to show status)
        const inventoryData = await InventoryItem.find().limit(5);
        const formattedInventory = inventoryData.map(item => ({
            id: item._id,
            name: item.name,
            category: item.category || 'Uncategorized',
            stock: item.stock,
            status: item.stock > 20 ? 'In Stock' : 'Low Stock'
        }));

        // 6. Recent SMS Notifications
        const recentMessages = await Message.find()
            .populate('relatedOrderId')
            .populate('relatedCustomerId')
            .sort({ createdAt: -1 })
            .limit(5);
            
        const formattedMessages = recentMessages.map(msg => {
            const timeDiff = Math.floor((new Date().getTime() - new Date(msg.createdAt).getTime()) / 60000);
            let timeStr = `${timeDiff} min ago`;
            if (timeDiff > 60) timeStr = `${Math.floor(timeDiff/60)} hour ago`;
            if (timeDiff > 1440) timeStr = `${Math.floor(timeDiff/1440)} days ago`;

            return {
                id: msg._id,
                from: msg.recipientNumber,
                message: msg.messageContent,
                time: timeStr,
                unread: msg.status === 'failed' || msg.status === 'pending'
            };
        });

        res.json({
            metrics: {
                totalSales,
                todaySales,
                monthlySales,
                totalOrders,
                activeOrders,
                lowStockItems,
            },
            salesData,
            inventoryData: formattedInventory,
            smsNotifications: formattedMessages
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
});

export default router;
