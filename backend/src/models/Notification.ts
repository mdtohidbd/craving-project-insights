import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    type: 'order' | 'reservation' | 'message' | 'stock' | 'staff_signup';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    targetUserId?: mongoose.Types.ObjectId;
}

const notificationSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['order', 'reservation', 'message', 'stock', 'staff_signup'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
