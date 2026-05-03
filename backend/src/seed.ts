import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from './models/MenuItem';
import { InventoryItem } from './models/InventoryItem';
import Category from './models/Category';
import { Reservation } from './models/Reservation';
import connectDB from './config/db';

dotenv.config();

const seedMenuItems = [
  { originalId: 1, title: "Beet Avocado Toast", price: "$13.00", imageUrls: [
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
    "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=800",
    "https://images.unsplash.com/photo-1510693395961-030809228588?w=800"
  ], category: "Starters", description: "Beetroot hummus, avocado, pickled red onions, olive oil, sprinkled with everything bagel seasoning.", tags: ["GF"], addOns: [
    { name: 'Extra Dip Sauce', price: 20 },
    { name: 'Add Garlic Bread', price: 50 },
    { name: 'Extra Chips', price: 30 }
  ] },
  { originalId: 2, title: "Guacamole", price: "$10.00", imageUrls: [
    "https://images.unsplash.com/photo-1547005327-ef31e6a17238?w=800",
    "https://images.unsplash.com/photo-1628191139360-408306cd95b2?w=800",
    "https://images.unsplash.com/photo-1587339148387-afdec7ec6c8e?w=800"
  ], category: "Starters", description: "Choice of pita chips or corn chips.", tags: ["GF"], addOns: [
    { name: 'Extra Dip Sauce', price: 20 },
    { name: 'Add Garlic Bread', price: 50 },
    { name: 'Extra Chips', price: 30 }
  ] },
  { originalId: 13, title: "Loaded Cheese Nachos", price: "$14.00", imageUrls: [
    "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800",
    "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800",
    "https://images.unsplash.com/photo-1582191179719-d596403d652d?w=800"
  ], category: "Starters", description: "Corn chips loaded with cheese sauce, black beans, pickled red onions, tomatoes, green onions.", addOns: [
    { name: 'Extra Dip Sauce', price: 20 },
    { name: 'Add Garlic Bread', price: 50 },
    { name: 'Extra Chips', price: 30 }
  ] },
  { originalId: 3, title: "BYO Pita Wrap or Bowl", price: "$14.00", imageUrls: [
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800"
  ], category: "Main", description: "Choice of hummus, Cucumber, tomatoes, pickled red onions, mint, parsley, tahini, and pita.", tags: ["V"], allergens: "Contains wheat (pita). Gluten-free if bowl.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 14, title: "Tabbouleh Bowl", price: "$16.00", imageUrls: [
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800"
  ], category: "Main", description: "Tabbouleh salad, hummus, cucumber, plum tomatoes, pickles and tahini.", tags: ["V"], allergens: "Contains wheat.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 15, title: "Original Falafel Wrap", price: "$13.00", imageUrls: [
    "https://images.unsplash.com/photo-1547005327-ef31e6a17238?w=800",
    "https://images.unsplash.com/photo-1593001874117-c99c5ed9918a?w=800",
    "https://images.unsplash.com/photo-1610444583737-0113b1940960?w=800"
  ], category: "Main", description: "Hummus, cucumber, pickles, tomatoes, red onions, mint, parsley, tahini.", tags: ["V"], allergens: "Contains wheat.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 16, title: "Beyond Kebab", price: "$21.00", imageUrls: [
    "https://images.unsplash.com/photo-1529006557810-2747c43974e8?w=800",
    "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"
  ], category: "Main", description: "Beyond kebab served wrapped or on a plate with pita bread, rice, and grilled veggies.", tags: ["V"], allergens: "Contains wheat.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 17, title: "Desi Falafel Plate", price: "$16.00", imageUrls: [
    "https://images.unsplash.com/photo-1547005327-ef31e6a17238?w=800",
    "https://images.unsplash.com/photo-1593001874117-c99c5ed9918a?w=800",
    "https://images.unsplash.com/photo-1585937421612-70a0f2950031?w=800"
  ], category: "Main", description: "Falafel, hummus, cucumber, chopped tomatoes, and a grilled green chili.", tags: ["V", "GF"], allergens: "Contains sesame.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 4, title: "Beyond Burger", price: "$18.00", imageUrls: [
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
    "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800"
  ], category: "Main", description: "Beyond burger patty, lettuce, tomatoes, and pickled pink onions.", tags: ["V"], allergens: "Contains wheat, soy.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 18, title: "Beetroot Falafel Burger", price: "$18.00", imageUrls: [
    "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800",
    "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800",
    "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800"
  ], category: "Main", description: "Beetroot falafel patty, avocado, tomatoes, greens on a toasted bun.", tags: ["V"], allergens: "Contains wheat.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 25, title: "Gyro 'Carnitas' Tacos", price: "$18.00", imageUrls: [
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800",
    "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800"
  ], category: "Main", description: "Vegan carnitas and gyro blend in tacos.", tags: ["V"], allergens: "Contains soy, wheat.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 26, title: "Just Egg Scramble", price: "$17.00", imageUrls: [
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800",
    "https://images.unsplash.com/photo-1513442542250-854d436a73f2?w=800"
  ], category: "Main", description: "Plant-based egg scrambled with bell peppers and onions.", tags: ["V"], allergens: "Contains soy.", addOns: [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Patty', price: 120 },
    { name: 'Jalapenos', price: 20 },
    { name: 'Add Fried Egg', price: 40 }
  ] },
  { originalId: 5, title: "Lentil Soup", price: "$6.99", imageUrls: [
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    "https://images.unsplash.com/photo-1547744037-b80bdba1b6f0?w=800",
    "https://images.unsplash.com/photo-1625123628216-57642f48999e?w=800"
  ], category: "Soups", description: "Hearty and warming spiced lentil soup.", tags: ["V", "GF"], addOns: [
    { name: 'Extra Bread Roll', price: 25 },
    { name: 'Add Croutons', price: 15 }
  ] },
  { originalId: 39, title: "Roasted Tomato Bisque", price: "$7.50", imageUrls: [
    "https://images.unsplash.com/photo-1547514701-42782101795e?w=800",
    "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=800",
    "https://images.unsplash.com/photo-1513135065346-a098a63a73ee?w=800"
  ], category: "Soups", description: "Velvety roasted tomato soup with a cream swirl and fresh basil.", tags: ["V", "GF"], addOns: [
    { name: 'Extra Bread Roll', price: 25 },
    { name: 'Add Croutons', price: 15 }
  ] },
  { originalId: 42, title: "Truffle Parmesan Fries", price: "$9.50", imageUrls: [
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800",
    "https://images.unsplash.com/photo-1630384066252-11ca58893306?w=800",
    "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800"
  ], category: "Friendz Fries", description: "Crispy fries drizzled with truffle oil and shaved vegan parmesan.", tags: ["V"], addOns: [
    { name: 'Cheese Sauce Drizzle', price: 40 },
    { name: 'Beef Topping', price: 80 },
    { name: 'Jalapeno Slices', price: 20 }
  ] },
  { originalId: 38, title: "Berry Cheesecake", price: "$9.00", imageUrls: [
    "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800",
    "https://images.unsplash.com/photo-1508737804141-4c3b688e2546?w=800",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800"
  ], category: "Desserts", description: "Creamy vegan cheesecake topped with fresh mixed berries and coulis.", tags: ["V"], allergens: "Contains cashew.", addOns: [
    { name: 'Whipped Cream', price: 30 },
    { name: 'Extra Chocolate Sauce', price: 25 },
    { name: 'Vanilla Ice Cream Scoop', price: 50 }
  ] },
  { originalId: 10, title: "Iced Mocha Latte", price: "$5.00", imageUrls: [
    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800",
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800",
    "https://images.unsplash.com/photo-1572288651183-14690529d14a?w=800"
  ], category: "Coffee & Tea", description: "Rich espresso, chocolate syrup, and cold oat milk.", tags: ["V", "GF"], addOns: [
    { name: 'Extra Espresso Shot', price: 40 },
    { name: 'Oat Milk Swap', price: 30 },
    { name: 'Vanilla Syrup', price: 25 },
    { name: 'Caramel Drizzle', price: 20 }
  ] },
  { originalId: 30, title: "Berry Blast Mocktail", price: "$5.50", imageUrls: [
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800",
    "https://images.unsplash.com/photo-1536935338218-9bca6d269dba?w=800",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800"
  ], category: "Mocktails", description: "A vibrant blend of fresh mixed berries, mint, and sparkling soda.", tags: ["V", "GF"], addOns: [
    { name: 'Extra Ice', price: 0 },
    { name: 'No Ice', price: 0 },
    { name: 'Mint Leaves', price: 10 },
    { name: 'Sparkling Water Swap', price: 20 }
  ] }
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
