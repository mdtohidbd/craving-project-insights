import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { MenuItem } from '../models/MenuItem';
import connectDB from '../config/db';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const addOnsMap: Record<string, { name: string, price: number }[]> = {
    'Starters': [
        { name: 'Extra Dip Sauce', price: 20 },
        { name: 'Add Garlic Bread', price: 50 },
        { name: 'Extra Chips', price: 30 }
    ],
    'Main': [
        { name: 'Extra Cheese', price: 30 },
        { name: 'Extra Patty', price: 120 },
        { name: 'Jalapenos', price: 20 },
        { name: 'Add Fried Egg', price: 40 }
    ],
    'Soups': [
        { name: 'Extra Bread Roll', price: 25 },
        { name: 'Add Croutons', price: 15 }
    ],
    'Desserts': [
        { name: 'Whipped Cream', price: 30 },
        { name: 'Extra Chocolate Sauce', price: 25 },
        { name: 'Vanilla Ice Cream Scoop', price: 50 }
    ],
    'Coffee & Tea': [
        { name: 'Extra Espresso Shot', price: 40 },
        { name: 'Oat Milk Swap', price: 30 },
        { name: 'Vanilla Syrup', price: 25 },
        { name: 'Caramel Drizzle', price: 20 }
    ],
    'Mocktails': [
        { name: 'Extra Ice', price: 0 },
        { name: 'No Ice', price: 0 },
        { name: 'Mint Leaves', price: 10 },
        { name: 'Sparkling Water Swap', price: 20 }
    ],
    'Friendz Fries': [
        { name: 'Cheese Sauce Drizzle', price: 40 },
        { name: 'Beef Topping', price: 80 },
        { name: 'Jalapeno Slices', price: 20 }
    ]
};

const migrate = async () => {
    try {
        await connectDB();
        console.log('Connected to database for migration...');

        const items = await MenuItem.find({});
        console.log(`Found ${items.length} menu items.`);

        let updatedCount = 0;

        for (const item of items) {
            const category = item.category;
            // Find a match in our map (case insensitive)
            const matchedKey = Object.keys(addOnsMap).find(
                key => category.toLowerCase() === key.toLowerCase()
            );

            if (matchedKey) {
                const addOns = addOnsMap[matchedKey];
                // Always update for migration purposes in this phase
                await MenuItem.updateOne(
                    { _id: item._id },
                    { $set: { addOns: addOns } }
                );
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} items.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
