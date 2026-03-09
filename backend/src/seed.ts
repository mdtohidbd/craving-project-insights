import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from './models/MenuItem';
import { InventoryItem } from './models/InventoryItem';
import Category from './models/Category';
import connectDB from './config/db';

dotenv.config();

const seedMenuItems = [
  { originalId: 1, title: "Beet Avocado Toast", price: "$13.00", imageIdentifier: "beetAvocadoToast", category: "Starters", description: "Beetroot hummus, avocado, pickled red onions, olive oil, sprinkled with everything bagel seasoning.", tags: ["GF"] },
  { originalId: 2, title: "Guacamole", price: "$10.00", imageIdentifier: "guacamoleBowl", category: "Starters", description: "Choice of pita chips or corn chips.", tags: ["GF"] },
  { originalId: 13, title: "Loaded Cheese Nachos", price: "$14.00", imageIdentifier: "loadedCheeseNachos", category: "Starters", description: "Corn chips loaded with cheese sauce, black beans, pickled red onions, tomatoes, green onions." },
  { originalId: 3, title: "BYO Pita Wrap or Bowl", price: "$14", imageIdentifier: "byoPitaWrap", category: "Main", description: "Choice of hummus, Cucumber, tomatoes, pickled red onions, mint, parsley, tahini, and pita.", tags: ["V"], allergens: "Contains wheat (pita). Gluten-free if bowl." },
  { originalId: 14, title: "Tabbouleh Bowl", price: "$16", imageIdentifier: "tabboulehBowl", category: "Main", description: "Tabbouleh salad, hummus, cucumber, plum tomatoes, pickles and tahini.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 15, title: "Original Falafel Wrap", price: "$13", imageIdentifier: "originalFalafelWrap", category: "Main", description: "Hummus, cucumber, pickles, tomatoes, red onions, mint, parsley, tahini.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 16, title: "Beyond Kebab", price: "$21", imageIdentifier: "beyondKebab", category: "Main", description: "Beyond kebab served wrapped or on a plate with pita bread, rice, and grilled veggies.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 17, title: "Desi Falafel Plate", price: "$16", imageIdentifier: "desiFalafelPlate", category: "Main", description: "Falafel, hummus, cucumber, chopped tomatoes, and a grilled green chili.", tags: ["V", "GF"], allergens: "Contains sesame." },
  { originalId: 4, title: "Beyond Burger", price: "$18", imageIdentifier: "beyondBurger", category: "Main", description: "Beyond burger patty, lettuce, tomatoes, and pickled pink onions.", tags: ["V"], allergens: "Contains wheat, soy." },
  { originalId: 18, title: "Beetroot Falafel Burger", price: "$18", imageIdentifier: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600", category: "Main", description: "Beetroot falafel patty, avocado, tomatoes, greens on a toasted bun.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 25, title: "Gyro 'Carnitas' Tacos", price: "$18", imageIdentifier: "gyroCarnitasTacos", category: "Main", description: "Vegan carnitas and gyro blend in tacos.", tags: ["V"], allergens: "Contains soy, wheat." },
  { originalId: 26, title: "Just Egg Scramble", price: "$17", imageIdentifier: "justEggScramble", category: "Main", description: "Plant-based egg scrambled with bell peppers and onions.", tags: ["V"], allergens: "Contains soy." },
  { originalId: 5, title: "Lentil Soup", price: "$6.99", imageIdentifier: "menuShrimp", category: "Soups", description: "Hearty and warming spiced lentil soup.", tags: ["V", "GF"] },
  { originalId: 39, title: "Roasted Tomato Bisque", price: "$7.50", imageIdentifier: "soupsCollection", category: "Soups", description: "Velvety roasted tomato soup with a cream swirl and fresh basil.", tags: ["V", "GF"] },
  { originalId: 42, title: "Truffle Parmesan Fries", price: "$9.50", imageIdentifier: "friesCollection", category: "Friendz Fries", description: "Crispy fries drizzled with truffle oil and shaved vegan parmesan.", tags: ["V"] },
  { originalId: 38, title: "Berry Cheesecake", price: "$9.00", imageIdentifier: "dessertsCollection", category: "Desserts", description: "Creamy vegan cheesecake topped with fresh mixed berries and coulis.", tags: ["V"], allergens: "Contains cashew." },
  { originalId: 10, title: "Iced Mocha Latte", price: "$5.00", imageIdentifier: "menuLatte", category: "Coffee & Tea", description: "Rich espresso, chocolate syrup, and cold oat milk.", tags: ["V", "GF"] },
  { originalId: 30, title: "Berry Blast Mocktail", price: "$5.50", imageIdentifier: "mocktailsCollection", category: "Mocktails", description: "A vibrant blend of fresh mixed berries, mint, and sparkling soda.", tags: ["V", "GF"] }
];

const seedInventoryItems = [
    { name: "Premium Coffee Beans", category: "Beverages", stock: 120, unit: "kg", price: "$24.00", status: "In Stock" },
    { name: "Vanilla Syrup", category: "Add-ons", stock: 15, unit: "bottles", price: "$12.50", status: "Low Stock" },
    { name: "Croissants", category: "Food", stock: 45, unit: "pcs", price: "$3.50", status: "In Stock" },
    { name: "Almond Milk", category: "Dairy Alt", stock: 8, unit: "cartons", price: "$4.00", status: "Low Stock" },
    { name: "Espresso Cups", category: "Supplies", stock: 200, unit: "pcs", price: "$1.20", status: "In Stock" },
    { name: "Oat Milk", category: "Dairy Alt", stock: 24, unit: "cartons", price: "$4.50", status: "In Stock" },
    { name: "Matcha Powder", category: "Beverages", stock: 5, unit: "kg", price: "$45.00", status: "Low Stock" },
    { name: "Caramel Syrup", category: "Add-ons", stock: 30, unit: "bottles", price: "$12.50", status: "In Stock" },
];

const seedCategories = [
    { name: "All", order: 0 },
    { name: "Starters", order: 1 },
    { name: "Main", order: 2 },
    { name: "Soups", order: 3 },
    { name: "Sides", order: 4 },
    { name: "Friendz Fries", order: 5 },
    { name: "Desserts", order: 6 },
    { name: "Coffee & Tea", order: 7 },
    { name: "Mocktails", order: 8 }
];

const seedDatabase = async () => {
    try {
        await connectDB();
        
        await MenuItem.deleteMany({});
        await InventoryItem.deleteMany({});
        await Category.deleteMany({});
        
        console.log("Existing data cleared.");
        
        await MenuItem.insertMany(seedMenuItems);
        await InventoryItem.insertMany(seedInventoryItems);
        await Category.insertMany(seedCategories);
        
        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
