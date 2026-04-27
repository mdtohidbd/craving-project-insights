import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    type: 'order' | 'reservation' | 'message' | 'stock';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const notificationSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['order', 'reservation', 'message', 'stock'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
