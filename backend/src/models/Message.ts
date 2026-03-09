import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    recipientNumber: { type: String, required: true },
    messageContent: { type: String, required: true },
    type: { type: String, enum: ['automatic', 'custom'], required: true },
    status: { type: String, enum: ['sent', 'failed', 'pending'], required: true },
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false },
    relatedCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false }
}, {
    timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);
