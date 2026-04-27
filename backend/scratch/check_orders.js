const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', OrderSchema);

async function checkOrders() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/craving_insights');
        console.log('Connected to DB');
        const orders = await Order.find({ 
            tableNumber: '6', 
            status: { $ne: 'completed' } 
        });
        console.log('Orders found:', orders.length);
        console.log(JSON.stringify(orders, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkOrders();
