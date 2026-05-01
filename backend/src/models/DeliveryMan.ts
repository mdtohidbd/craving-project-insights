import mongoose from 'mongoose';

const deliveryManSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    vehicleDetails: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, {
    timestamps: true
});

export const DeliveryMan = mongoose.model('DeliveryMan', deliveryManSchema);
