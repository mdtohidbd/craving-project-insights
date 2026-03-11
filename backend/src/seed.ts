import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from './models/MenuItem';
import { InventoryItem } from './models/InventoryItem';
import Category from './models/Category';
import { Reservation } from './models/Reservation';
import connectDB from './config/db';

dotenv.config();

const seedMenuItems = [
<<<<<<< HEAD
  { originalId: 1, title: "Beet Avocado Toast", price: "$13.00", imageUrl: "beetAvocadoToast", category: "Starters", description: "Beetroot hummus, avocado, pickled red onions, olive oil, sprinkled with everything bagel seasoning.", tags: ["GF"] },
  { originalId: 2, title: "Guacamole", price: "$10.00", imageUrl: "guacamoleBowl", category: "Starters", description: "Choice of pita chips or corn chips.", tags: ["GF"] },
  { originalId: 13, title: "Loaded Cheese Nachos", price: "$14.00", imageUrl: "loadedCheeseNachos", category: "Starters", description: "Corn chips loaded with cheese sauce, black beans, pickled red onions, tomatoes, green onions." },
  { originalId: 3, title: "BYO Pita Wrap or Bowl", price: "$14", imageUrl: "byoPitaWrap", category: "Main", description: "Choice of hummus, Cucumber, tomatoes, pickled red onions, mint, parsley, tahini, and pita.", tags: ["V"], allergens: "Contains wheat (pita). Gluten-free if bowl." },
  { originalId: 14, title: "Tabbouleh Bowl", price: "$16", imageUrl: "tabboulehBowl", category: "Main", description: "Tabbouleh salad, hummus, cucumber, plum tomatoes, pickles and tahini.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 15, title: "Original Falafel Wrap", price: "$13", imageUrl: "originalFalafelWrap", category: "Main", description: "Hummus, cucumber, pickles, tomatoes, red onions, mint, parsley, tahini.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 16, title: "Beyond Kebab", price: "$21", imageUrl: "beyondKebab", category: "Main", description: "Beyond kebab served wrapped or on a plate with pita bread, rice, and grilled veggies.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 17, title: "Desi Falafel Plate", price: "$16", imageUrl: "desiFalafelPlate", category: "Main", description: "Falafel, hummus, cucumber, chopped tomatoes, and a grilled green chili.", tags: ["V", "GF"], allergens: "Contains sesame." },
  { originalId: 4, title: "Beyond Burger", price: "$18", imageUrl: "beyondBurger", category: "Main", description: "Beyond burger patty, lettuce, tomatoes, and pickled pink onions.", tags: ["V"], allergens: "Contains wheat, soy." },
  { originalId: 18, title: "Beetroot Falafel Burger", price: "$18", imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600", category: "Main", description: "Beetroot falafel patty, avocado, tomatoes, greens on a toasted bun.", tags: ["V"], allergens: "Contains wheat." },
  { originalId: 25, title: "Gyro 'Carnitas' Tacos", price: "$18", imageUrl: "gyroCarnitasTacos", category: "Main", description: "Vegan carnitas and gyro blend in tacos.", tags: ["V"], allergens: "Contains soy, wheat." },
  { originalId: 26, title: "Just Egg Scramble", price: "$17", imageUrl: "justEggScramble", category: "Main", description: "Plant-based egg scrambled with bell peppers and onions.", tags: ["V"], allergens: "Contains soy." },
  { originalId: 5, title: "Lentil Soup", price: "$6.99", imageUrl: "menuShrimp", category: "Soups", description: "Hearty and warming spiced lentil soup.", tags: ["V", "GF"] },
  { originalId: 39, title: "Roasted Tomato Bisque", price: "$7.50", imageUrl: "soupsCollection", category: "Soups", description: "Velvety roasted tomato soup with a cream swirl and fresh basil.", tags: ["V", "GF"] },
  { originalId: 42, title: "Truffle Parmesan Fries", price: "$9.50", imageUrl: "friesCollection", category: "Friendz Fries", description: "Crispy fries drizzled with truffle oil and shaved vegan parmesan.", tags: ["V"] },
  { originalId: 38, title: "Berry Cheesecake", price: "$9.00", imageUrl: "dessertsCollection", category: "Desserts", description: "Creamy vegan cheesecake topped with fresh mixed berries and coulis.", tags: ["V"], allergens: "Contains cashew." },
  { originalId: 10, title: "Iced Mocha Latte", price: "$5.00", imageUrl: "menuLatte", category: "Coffee & Tea", description: "Rich espresso, chocolate syrup, and cold oat milk.", tags: ["V", "GF"] },
  { originalId: 30, title: "Berry Blast Mocktail", price: "$5.50", imageUrl: "mocktailsCollection", category: "Mocktails", description: "A vibrant blend of fresh mixed berries, mint, and sparkling soda.", tags: ["V", "GF"] }
=======
  { originalId: 1, title: "Beet Avocado Toast", price: "$13", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600", category: "Starters", description: "Beetroot hummus, avocado, pickled red onions, olive oil, sprinkled with everything bagel seasoning.", tags: ["GF"] },
  { originalId: 2, title: "Guacamole", price: "$10", imageUrl: "guacamoleCustom", category: "Starters", description: "Choice of pita chips or corn chips.", tags: ["GF"] },
  { originalId: 13, title: "Loaded Cheese Nachos", price: "$14", imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600", category: "Starters", description: "Corn chips loaded with cheese sauce, black beans, pickled red onions, tomatoes, green onions." },
  { originalId: 3, title: "BYO Pita Wrap or Bowl", price: "$14", imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600", category: "Main", description: "Choice of hummus, Cucumber, tomatoes, pickled red onions, mint, parsley, tahini, and pita.", tags: ["V"] },
  { originalId: 14, title: "Tabbouleh Bowl", price: "$16", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600", category: "Main", description: "Tabbouleh salad, hummus, cucumber, plum tomatoes, pickles and tahini.", tags: ["V"] },
  { originalId: 15, title: "Original Falafel Wrap", price: "$13", imageUrl: "originalFalafelWrapCustom", category: "Main", description: "Hummus, cucumber, pickles, tomatoes, red onions, mint, parsley, tahini.", tags: ["V"] },
  { originalId: 16, title: "Beyond Kebab", price: "$21", imageUrl: "beyondKebabCustom", category: "Main", description: "Beyond kebab served wrapped or on a plate with pita bread, rice, and grilled veggies.", tags: ["V"] },
  { originalId: 17, title: "Desi Falafel Plate", price: "$16", imageUrl: "desiFalafelPlateCustom", category: "Main", description: "Falafel, hummus, cucumber, chopped tomatoes, and a grilled green chili.", tags: ["V", "GF"] },
  { originalId: 4, title: "Beyond Burger", price: "$18", imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600", category: "Main", description: "Beyond burger patty, lettuce, tomatoes, and pickled pink onions.", tags: ["V"] },
  { originalId: 20, title: "Beetroot Falafel Burger", price: "$18", imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600", category: "Main", description: "Beetroot falafel patty, avocado, tomatoes, greens on a toasted bun.", tags: ["V"] },
  { originalId: 25, title: "Gyro 'Carnitas' Tacos", price: "$18", imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600", category: "Main", description: "Vegan carnitas and gyro blend in tacos.", tags: ["V"] },
  { originalId: 26, title: "Just Egg Scramble", price: "$17", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600", category: "Main", description: "Plant-based egg scrambled with bell peppers and onions.", tags: ["V"] },
  { originalId: 5, title: "Lentil Soup", price: "$7", imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600", category: "Soups", description: "Hearty and warming spiced lentil soup.", tags: ["V", "GF"] },
  { originalId: 39, title: "Roasted Tomato Bisque", price: "$8", imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?w=600", category: "Soups", description: "Velvety roasted tomato soup with a cream swirl and fresh basil.", tags: ["V", "GF"] },
  { originalId: 42, title: "Truffle Parmesan Fries", price: "$10", imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600", category: "Friendz Fries", description: "Crispy fries drizzled with truffle oil and shaved vegan parmesan.", tags: ["V"] },
  { originalId: 38, title: "Berry Cheesecake", price: "$9", imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600", category: "Desserts", description: "Creamy vegan cheesecake topped with fresh mixed berries and coulis.", tags: ["V"] },
  { originalId: 10, title: "Iced Mocha Latte", price: "$5", imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600", category: "Coffee & Tea", description: "Rich espresso, chocolate syrup, and cold oat milk.", tags: ["V", "GF"] },
  { originalId: 30, title: "Berry Blast Mocktail", price: "$6", imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600", category: "Mocktails", description: "A vibrant blend of fresh mixed berries, mint, and sparkling soda.", tags: ["V", "GF"] }
>>>>>>> c851fe1fb7d80b530f38412dbf45ed07301d64f1
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

const seedReservations = [
    { date: "2026-03-12", time: "19:00", guests: "2", name: "Toheed", phone: "01700000000", requests: "Window seat please", bookingId: "RES-777888", status: "pending" },
    { date: "2026-03-13", time: "20:30", guests: "4", name: "Hasan", phone: "01800000000", requests: "Birthday celebration", bookingId: "RES-999000", status: "confirmed" }
];

const seedDatabase = async () => {
    try {
        await connectDB();
        
        await MenuItem.deleteMany({});
        await InventoryItem.deleteMany({});
        await Category.deleteMany({});
        await Reservation.deleteMany({});
        
        console.log("Existing data cleared.");
        
        await MenuItem.insertMany(seedMenuItems);
        await InventoryItem.insertMany(seedInventoryItems);
        await Category.insertMany(seedCategories);
        await Reservation.insertMany(seedReservations);
        
        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
