import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItemId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
}, { _id: false });

const splitPaymentSchema = new mongoose.Schema({
    method: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customerInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        notes: { type: String, required: false }
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    smsStatus: { type: String, default: 'pending' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    paymentMethod: { type: String },
    amountReceived: { type: Number, default: 0 },
    changeAmount: { type: Number, default: 0 },
    splitPayments: [splitPaymentSchema],
    isHeld: { type: Boolean, default: false },
    heldAt: { type: Date },
    tableNumber: { type: String },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    orderType: { type: String, default: 'dine-in' }, // dine-in, takeaway, online
    deliveryManId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryMan' },
    deliveryStatus: { type: String, enum: ['pending', 'assigned', 'out_for_delivery', 'delivered'], default: 'pending' }
}, {
    timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
