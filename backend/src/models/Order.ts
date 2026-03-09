import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItemId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
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
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    smsStatus: { type: String, default: 'pending' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
}, {
    timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
