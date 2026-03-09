import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  deliveryFee: number;
  adminPassword?: string;
  smsNumber?: string;
}

const SettingsSchema: Schema = new Schema({
  deliveryFee: { type: Number, required: true, default: 50 },
  adminPassword: { type: String, default: "" },
  smsNumber: { type: String, default: "" }
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
