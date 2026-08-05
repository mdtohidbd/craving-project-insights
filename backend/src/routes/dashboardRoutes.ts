import express from 'express';
import { Order } from '../models/Order';
import { InventoryItem } from '../models/InventoryItem';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { DeliveryMan } from '../models/DeliveryMan';
import { MenuItem } from '../models/MenuItem';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Run all primary database queries in parallel for ultra-fast response
        const [
            completedOrders,
            activeOrders,
            lowStockItems,
            inventoryData,
            recentMessages,
            activeStaff,
            activeDeliveryMen,
            menuItems,
            latestOrders
        ] = await Promise.all([
            Order.find({ status: { $in: ['completed', 'delivered'] } }),
            Order.countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] } }),
            InventoryItem.countDocuments({ stock: { $lt: 20 } }),
            InventoryItem.find().limit(5),
            Message.find().populate('relatedOrderId').populate('relatedCustomerId').sort({ createdAt: -1 }).limit(5),
            User.find({ role: 'staff', status: 'approved' }),
            DeliveryMan.find({ status: 'active' }),
            MenuItem.find(),
            Order.find().sort({ createdAt: -1 }).limit(8).populate('customerId', 'name')
        ]);

        // 1. Calculate Metrics
        const totalSales = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = completedOrders.length;
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todaySales = completedOrders
            .filter(o => new Date(o.createdAt || new Date()) >= startOfToday)
            .reduce((sum, order) => sum + (order.total || 0), 0);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlySales = completedOrders
            .filter(o => new Date(o.createdAt || new Date()) >= startOfMonth)
            .reduce((sum, order) => sum + (order.total || 0), 0);

        // 2. Compute 7 Days Sales Data in Memory (Instant, 0 DB roundtrips)
        const salesData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dailySales = completedOrders
                .filter(o => {
                    const cDate = new Date(o.createdAt || new Date());
                    return cDate >= date && cDate < nextDay;
                })
                .reduce((sum, order) => sum + (order.total || 0), 0);
            
            salesData.push({
                name: days[date.getDay()],
                date: String(date.getDate()).padStart(2, '0'),
                sales: dailySales
            });
        }

        // 3. Format Inventory Preview
        const formattedInventory = inventoryData.map(item => ({
            id: item._id,
            name: item.name,
            category: item.category || 'Uncategorized',
            stock: item.stock,
            status: item.stock > 20 ? 'In Stock' : 'Low Stock'
        }));

        // 4. Format Recent Messages
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

        // 5. Staff Breakdown & Deliverymen
        const staffRoleCounts: Record<string, number> = {};
        activeStaff.forEach(staff => {
            const role = staff.staffRole || 'unassigned';
            staffRoleCounts[role] = (staffRoleCounts[role] || 0) + 1;
        });
        const staffRoleBreakdown = Object.entries(staffRoleCounts).map(([role, count]) => ({ role, count }));

        const deliveryManPerformance = await Promise.all(activeDeliveryMen.map(async (dm) => {
            const deliveredCount = await Order.countDocuments({ 
                deliveryManId: dm._id, 
                deliveryStatus: 'delivered' 
            });
            return {
                id: dm._id,
                name: dm.name,
                phone: dm.phone,
                completedOrders: deliveredCount
            };
        }));
        
        deliveryManPerformance.sort((a, b) => b.completedOrders - a.completedOrders);
        const topDeliveryMen = deliveryManPerformance.slice(0, 5);

        // 6. Category Sales, Top Items, and Payment Methods (Compute in Memory)
        const menuMap = new Map();
        menuItems.forEach(item => {
            menuMap.set(item._id.toString(), item.category || 'Others');
            if (item.originalId) menuMap.set(item.originalId.toString(), item.category || 'Others');
        });

        const categorySalesMap: Record<string, number> = {};
        const topItemsMap: Record<string, { quantity: number; revenue: number }> = {};
        const paymentMethodsMap: Record<string, number> = {};

        completedOrders.forEach(order => {
            const method = order.paymentMethod?.includes('bKash') || order.paymentMethod?.includes('Mobile') ? 'Mobile' :
                           order.paymentMethod?.includes('Card') ? 'Card' : 'Cash';
            paymentMethodsMap[method] = (paymentMethodsMap[method] || 0) + 1;

            const items = order.items || [];
            const totalItemsInOrder = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
            
            items.forEach((item: any) => {
                const category = menuMap.get(item.menuItemId?.toString()) || 'Others';
                const itemRevShare = totalItemsInOrder > 0 
                    ? Math.round((order.total || 0) * (item.quantity / totalItemsInOrder))
                    : 0;

                categorySalesMap[category] = (categorySalesMap[category] || 0) + itemRevShare;

                const itemName = item.title || 'Unknown Item';
                if (!topItemsMap[itemName]) topItemsMap[itemName] = { quantity: 0, revenue: 0 };
                topItemsMap[itemName].quantity += item.quantity;
                topItemsMap[itemName].revenue += itemRevShare;
            });
        });

        const totalOrderCountForPayments = completedOrders.length || 1;
        const paymentMethods = Object.entries(paymentMethodsMap).map(([method, count]) => ({
            method,
            count,
            percentage: Number(((count / totalOrderCountForPayments) * 100).toFixed(1))
        }));

        let categorySales = Object.entries(categorySalesMap).map(([category, sales]) => ({
            category,
            sales,
            percentage: totalSales > 0 ? Number(((sales / totalSales) * 100).toFixed(1)) : 0
        }));
        
        if (categorySales.length === 0) {
           categorySales = [
               { category: "Appetizers", sales: 0, percentage: 0 },
               { category: "Main Course", sales: 0, percentage: 0 },
               { category: "Desserts", sales: 0, percentage: 0 },
               { category: "Beverages", sales: 0, percentage: 0 },
               { category: "Others", sales: 0, percentage: 0 }
           ];
        }

        const topItems = Object.entries(topItemsMap)
            .map(([name, data]) => ({ name, quantity: data.quantity, revenue: data.revenue }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // 7. Format Recent Orders
        const recentOrders = latestOrders.map(order => {
            const timeDiff = Math.floor((new Date().getTime() - new Date(order.createdAt || new Date()).getTime()) / 60000);
            let timeStr = `${timeDiff} min ago`;
            if (timeDiff > 60) timeStr = `${Math.floor(timeDiff/60)} hr ago`;
            if (timeDiff > 1440) timeStr = `${Math.floor(timeDiff/1440)} days ago`;

            return {
                id: order._id,
                orderId: order._id.toString().substring(order._id.toString().length - 6).toUpperCase(),
                customerName: order.customerId ? (order.customerId as any).name || order.customerInfo?.name : order.customerInfo?.name || 'Walk-in',
                items: (order.items || []).map((i: any) => ({ name: i.title || 'Unknown', quantity: i.quantity })),
                total: order.total,
                status: order.status,
                time: timeStr,
                timestamp: order.createdAt
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
            smsNotifications: formattedMessages,
            staffData: {
                activeStaffCount: activeStaff.length,
                activeDeliveryManCount: activeDeliveryMen.length,
                staffRoleBreakdown,
                deliveryManPerformance: topDeliveryMen
            },
            categorySales,
            topItems,
            paymentMethods,
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
});

export default router;
