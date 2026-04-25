import express from 'express';
import { MenuItem } from '../models/MenuItem';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find({}).sort({ originalId: 1 });
        // Map originalId to id for frontend compatibility
        const mappedItems = items.map(item => ({
            _id: item._id,
            id: item.originalId,
            title: item.title,
            price: item.price,
            category: item.category,
            description: item.description,
            tags: item.tags,
            image: item.imageUrl,
            sku: item.sku,
            discountPrice: item.discountPrice,
            taxIncluded: item.taxIncluded,
            available: item.available
        }));
        res.json(mappedItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, price, category, description, tags, originalId, sku, discountPrice, taxIncluded, available } = req.body;
        
        // Wait, what if there's no image?
        if (!req.file) {
             res.status(400).json({ message: 'Image is required' });
             return; // Add return to avoid falling through
        }

        // Upload to Cloudinary using a buffer
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'craving-menu',
        });

        // Parse tags if it's sent as a string
        let tagsArray: string[] = [];
        if (tags) {
            tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        const newMenuItem = new MenuItem({
            originalId: Number(originalId) || Math.floor(Math.random() * 1000000), // Random ID if not provided
            title,
            price,
            category,
            description,
            tags: tagsArray,
            imageUrl: result.secure_url,
            sku,
            discountPrice,
            taxIncluded: taxIncluded === 'true' || taxIncluded === true,
            available: available !== 'false' && available !== false
        });

        const savedItem = await newMenuItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Failed to create menu item:', error);
        res.status(500).json({ message: 'Failed to create menu item', error });
    }
});

router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, price, category, description, tags, sku, discountPrice, taxIncluded, available } = req.body;
        
        let updateData: any = { 
            title, price, category, description, sku, discountPrice,
            taxIncluded: taxIncluded === 'true' || taxIncluded === true,
            available: available !== 'false' && available !== false
        };
        if (tags) {
            updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'craving-menu',
            });
            updateData.imageUrl = result.secure_url;
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update menu item', error });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete menu item', error });
    }
});

export default router;
