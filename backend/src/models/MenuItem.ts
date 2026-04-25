import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    // We keep the original numeric ID for easy mapping on the frontend with static images
    originalId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: false },
    tags: { type: [String], required: false, default: [] },
    imageUrl: { type: String, required: true },
    sku: { type: String, required: false },
    discountPrice: { type: String, required: false },
    taxIncluded: { type: Boolean, default: false },
    available: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
