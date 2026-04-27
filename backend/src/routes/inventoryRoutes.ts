import express from 'express';
import { InventoryItem } from '../models/InventoryItem';
import Notification from '../models/Notification';

const router = express.Router();

// Get all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await InventoryItem.find({}).sort({ createdAt: -1 });
        
        // Frontend uses 'id' instead of '_id', we map it here
        const mappedItems = items.map(item => ({
            id: item._id, // Keep it as string, frontend will use it as unique key
            name: item.name,
            category: item.category,
            stock: item.stock,
            unit: item.unit,
            price: item.price,
            status: item.status
        }));
        res.json(mappedItems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create new inventory item
router.post('/', async (req, res) => {
    try {
        const newItem = new InventoryItem(req.body);
        const savedItem = await newItem.save();
        res.status(201).json({
            id: savedItem._id,
            name: savedItem.name,
            category: savedItem.category,
            stock: savedItem.stock,
            unit: savedItem.unit,
            price: savedItem.price,
            status: savedItem.status
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
});

// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const updatedItem = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        
        // Create stock alert if stock is low (e.g., <= 5)
        if (updatedItem.stock <= 5) {
            await Notification.create({
                type: 'stock',
                title: 'Low Stock Alert' + (updatedItem.stock === 0 ? ' (Out of Stock)' : ''),
                message: `${updatedItem.name} has only ${updatedItem.stock} ${updatedItem.unit} remaining.`,
            });
        }
        
        res.json({
            id: updatedItem._id,
            name: updatedItem.name,
            category: updatedItem.category,
            stock: updatedItem.stock,
            unit: updatedItem.unit,
            price: updatedItem.price,
            status: updatedItem.status
        });
    } catch (error) {
        res.status(400).json({ message: 'Update failed' });
    }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

export default router;
