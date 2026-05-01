import mongoose, { Schema, Document } from 'mongoose';

export interface IModuleConfig {
    id: string;
    label: string;
    enabled: boolean;
}

export interface ISettings extends Document {
    deliveryFee: number;
    adminPassword?: string;
    smsNumber?: string;
    globalModules: IModuleConfig[];
}

const ModuleConfigSchema = new Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    enabled: { type: Boolean, default: true },
}, { _id: false });

const SettingsSchema: Schema = new Schema({
    deliveryFee: { type: Number, required: true, default: 50 },
    adminPassword: { type: String, default: '' },
    smsNumber: { type: String, default: '' },
    globalModules: {
        type: [ModuleConfigSchema],
        default: [
            { id: 'dashboard',     label: 'Dashboard',       enabled: true },
            { id: 'tables',        label: 'Tables',           enabled: true },
            { id: 'pos',           label: 'POS System',       enabled: true },
            { id: 'orders',        label: 'Orders',           enabled: true },
            { id: 'delivery',      label: 'Delivery',         enabled: true },
            { id: 'customers',     label: 'Customers',        enabled: true },
            { id: 'menu',          label: 'Menu Items',       enabled: true },
            { id: 'inventory',     label: 'Inventory',        enabled: true },
            { id: 'reservations',  label: 'Reservations',     enabled: true },
            { id: 'notifications', label: 'Notifications',    enabled: true },
            { id: 'messages',      label: 'Messages',         enabled: true },
            { id: 'settings',      label: 'Settings',         enabled: true },
            { id: 'users',         label: 'User Management',  enabled: true },
            { id: 'modules',       label: 'Module Control',   enabled: true },
        ],
    },
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

