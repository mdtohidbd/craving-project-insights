import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, required: true } // e.g. "In Stock", "Low Stock", "Out of Stock"
}, {
    timestamps: true
});

export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
