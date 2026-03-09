import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ShoppingCart, Minus, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

import menuMojito from "@/assets/menu-mojito.jpg";
import menuCoconut from "@/assets/menu-coconut.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import menuDessert from "@/assets/menu-dessert.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import heroFood from "@/assets/hero-food.jpg";

import beetAvocadoToast from "@/assets/beet_avocado_toast.png";
import guacamoleBowl from "@/assets/guacamole_bowl.png";
import loadedCheeseNachos from "@/assets/loaded_cheese_nachos.png";
import byoPitaWrap from "@/assets/byo_pita_wrap.png";
import tabboulehBowl from "@/assets/tabbouleh_bowl.png";
import originalFalafelWrap from "@/assets/original_falafel_wrap.png";
import beyondKebab from "@/assets/beyond_kebab.png";
import desiFalafelPlate from "@/assets/desi_falafel_plate.png";
import beyondBurger from "@/assets/beyond_burger.png";
import justEggScramble from "@/assets/just_egg_scramble.png";
import gyroCarnitasTacos from "@/assets/gyro_carnitas_tacos.png";
import dessertsCollection from "@/assets/desserts_collection.png";
import mocktailsCollection from "@/assets/mocktails_collection.png";
import coffeTeaCollection from "@/assets/coffee_tea_collection.png";
import friesCollection from "@/assets/fries_collection.png";
import soupsCollection from "@/assets/soups_collection.png";

const DiamondStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const getShapeClass = (index: number) => {
  const shapes = [
    "rounded-full",
    "rounded-[0_50%_0_50%]",
    "rounded-[50%_0_50%_0]",
    "rounded-[50%_0_0_50%]",
    "rounded-[0_50%_50%_0]",
  ];
  return shapes[index % shapes.length];
};

const allMenuItems = [
  { 
    id: "1", 
    title: "Beet Avocado Toast", 
    price: "$13.00", 
    image: beetAvocadoToast, 
    category: "Starters", 
    description: "Beetroot hummus, avocado, pickled red onions, olive oil, sprinkled with everything bagel seasoning.", 
    tags: ["GF"],
    longDescription: "Our Beet Avocado Toast is a vibrant and healthy start to your meal. We layer creamy beetroot hummus on thick-cut toasted bread, topped with fresh avocado slices, tangy pickled red onions, and a drizzle of premium olive oil. Finished with a generous sprinkle of everything bagel seasoning for that perfect crunch.",
    overview: "Freshly prepared avocado toast with house-made beetroot hummus.",
    ingredients: ["Thick-cut sourdough", "Beetroot hummus", "Fresh avocado", "Pickled red onions", "Everything bagel seasoning", "Extra virgin olive oil"]
  },
  { 
    id: "2", 
    title: "Guacamole", 
    price: "$10.00", 
    image: guacamoleBowl, 
    category: "Starters", 
    description: "Choice of pita chips or corn chips.", 
    tags: ["GF"],
    longDescription: "Classic, creamy guacamole made daily with ripe Hass avocados, fresh lime juice, cilantro, and red onions. Perfectly balanced and served with your choice of crispy pita chips or gluten-free corn chips.",
    overview: "Freshly mashed avocado dip served with chips.",
    ingredients: ["Ripe Hass avocados", "Fresh lime juice", "Cilantro", "Red onion", "Jalapeño (optional)", "Pita or Corn chips"]
  },
  { 
    id: "13", 
    title: "Loaded Cheese Nachos", 
    price: "$14.00", 
    image: loadedCheeseNachos, 
    category: "Starters", 
    description: "Corn chips loaded with cheese sauce, black beans, pickled red onions, tomatoes, green onions.",
    longDescription: "A crowd favorite! Crispy corn chips piled high and smothered in our velvety vegan cheese sauce. Topped with protein-rich black beans, zesty pickled red onions, fresh diced tomatoes, and crisp green onions for an explosion of flavors and textures.",
    overview: "Nacho platter with vegan cheese sauce and fresh toppings.",
    ingredients: ["Corn tortilla chips", "Vegan cheese sauce", "Black beans", "Pickled red onions", "Fresh tomatoes", "Green onions"]
  },
  { 
    id: "3", 
    title: "BYO Pita Wrap or Bowl", 
    price: "$14", 
    image: byoPitaWrap, 
    category: "Main", 
    description: "Choice of hummus, Cucumber, tomatoes, pickled red onions, mint, parsley, tahini, and pita.", 
    tags: ["V"],
    longDescription: "Build your own masterpiece! Choose between a warm pita wrap or a fresh bowl (GF). We start with your base and add smooth hummus, crisp cucumbers, juicy tomatoes, pickled red onions, and fresh herbs like mint and parsley. Finished with a drizzle of creamy tahini sauce.",
    overview: "Customizable Mediterranean wrap or bowl.",
    ingredients: ["Warm pita or Grain base", "Traditional hummus", "Fresh cucumber", "Plum tomatoes", "Pickled red onions", "Fresh mint & parsley", "House tahini"]
  },
  { 
    id: "14", 
    title: "Tabbouleh Bowl", 
    price: "$16", 
    image: tabboulehBowl, 
    category: "Main", 
    description: "Tabbouleh salad, hummus, cucumber, plum tomatoes, pickles and tahini.", 
    tags: ["V"],
    longDescription: "A refreshing and nutritious bowl centered around our signature tabbouleh salad. Accompanied by creamy hummus, crunchy cucumbers, sweet plum tomatoes, and tangy pickles. Drizzled with our house-made tahini sauce for a perfect finish.",
    overview: "Traditional herb-forward salad bowl.",
    ingredients: ["Finely chopped parsley", "Bulgur wheat", "Traditional hummus", "Cucumber", "Plum tomatoes", "Middle Eastern pickles", "Tahini sauce"]
  },
  { 
    id: "15", 
    title: "Original Falafel Wrap", 
    price: "$13", 
    image: originalFalafelWrap, 
    category: "Main", 
    description: "Hummus, cucumber, pickles, tomatoes, red onions, mint, parsley, tahini.", 
    tags: ["V"],
    longDescription: "The classic Mediterranean street food! Our crispy, green falafel is wrapped in warm pita with smooth hummus, crunchy pickles, fresh vegetables, and a medley of herbs. The tahini sauce pulls everything together for an authentic flavor experience.",
    overview: "Classic house-made falafel in a warm pita wrap.",
    ingredients: ["Freshly fried falafel", "Warm pita", "Hummus", "Cucumber", "Pickles", "Red onion", "Mint and Parsley", "Tahini"]
  },
  { 
    id: "16", 
    title: "Beyond Kebab", 
    price: "$21", 
    image: beyondKebab, 
    category: "Main", 
    description: "Beyond kebab served wrapped or on a plate with pita bread, rice, and grilled veggies.", 
    tags: ["V"],
    longDescription: "A premium plant-based kebab experience. Seasoned Beyond Meat is grilled to perfection and served on your choice of warm pita or a generous plate with aromatic rice and charred garden vegetables. A hearty and satisfying gourmet meal.",
    overview: "Grilled plant-based kebab served with Mediterranean sides.",
    ingredients: ["Beyond Meat kebab", "Aromatic rice or Pita", "Grilled bell peppers", "Grilled zucchini", "Garlic sauce", "Persian spices"]
  },
  { 
    id: "17", 
    title: "Desi Falafel Plate", 
    price: "$16", 
    image: desiFalafelPlate, 
    category: "Main", 
    description: "Falafel, hummus, cucumber, chopped tomatoes, and a grilled green chili.", 
    tags: ["V", "GF"],
    longDescription: "An Indian-inspired twist on the falafel plate. This gluten-free option features our signature falafel served with traditional hummus, fresh chopped veggies, and a spicy grilled green chili for those who enjoy a bit of heat.",
    overview: "Spiced falafel platter with a South Asian flare.",
    ingredients: ["House falafel", "Traditional hummus", "Chopped cucumber", "Chopped tomatoes", "Grilled green chili", "Balsamic glaze"]
  },
  { 
    id: "4", 
    title: "Beyond Burger", 
    price: "$18", 
    image: beyondBurger, 
    category: "Main", 
    description: "Beyond burger patty, lettuce, tomatoes, and pickled pink onions.", 
    tags: ["V"],
    longDescription: "The ultimate vegan burger. A juicy Beyond Meat patty is seared and served on a toasted bun with crisp lettuce, ripe tomato slices, and our signature pickled pink onions for a tangy crunch. Served with a side of your choice.",
    overview: "Classic burger reimagined with plant-based excellence.",
    ingredients: ["Beyond Meat patty", "Vegan brioche bun", "Romaine lettuce", "Fresh tomatoes", "Pickled pink onions", "House burger sauce"]
  },
  { 
    id: "5", 
    title: "Lentil Soup", 
    price: "$6.99", 
    image: menuShrimp, 
    category: "Soups", 
    description: "Hearty and warming spiced lentil soup.", 
    tags: ["V", "GF"],
    longDescription: "A comforting bowl of traditional lentil soup, simmered slowly with Middle Eastern spices, carrots, and celery. Rich in protein and flavor, it's the perfect companion to any meal or a light lunch on its own.",
    overview: "Wholesome spiced red lentil soup.",
    ingredients: ["Red lentils", "Cumin", "Turmeric", "Carrots", "Onions", "Vegetable broth", "Lemon wedge"]
  },
  { 
    id: "9", 
    title: "Golden Bliss Vegan Cake", 
    price: "$10.00", 
    image: menuDessert, 
    category: "Desserts", 
    description: "A decadent golden creation balancing perfect flavors and textures.",
    tags: ["V", "GF"],
    longDescription: "End your meal on a golden note. This decadent vegan and gluten-free cake features layers of light sponge and creamy filling, balanced with premium ingredients. It's a texture-rich masterpiece that proves vegan desserts can be truly divine.",
    overview: "Signature golden sponge cake with vegan cream.",
    ingredients: ["GF Flour blend", "Almond milk", "Coconut sugar", "Organic vanilla", "Vegan buttercream", "Edible gold accents"]
  },
  { 
    id: "4", 
    title: "Beyond Burger", 
    price: "$18", 
    image: beyondBurger, 
    category: "Main", 
    description: "Beyond burger patty, lettuce, tomatoes, and pickled pink onions.",
    tags: ["V"],
    longDescription: "The ultimate vegan burger. A juicy Beyond Meat patty is seared and served on a toasted bun with crisp lettuce, ripe tomato slices, and our signature pickled pink onions for a tangy crunch.",
    overview: "Classic burger reimagined with plant-based excellence.",
    ingredients: ["Beyond Meat patty", "Vegan brioche bun", "Romaine lettuce", "Fresh tomatoes", "Pickled pink onions", "House burger sauce"]
  },
  { 
    id: "5", 
    title: "Lentil Soup", 
    price: "$6.99", 
    image: menuShrimp, 
    category: "Soups", 
    description: "Hearty and warming spiced lentil soup.",
    tags: ["V", "GF"],
    longDescription: "A comforting bowl of traditional lentil soup, simmered slowly with Middle Eastern spices, carrots, and celery. Rich in protein and flavor.",
    overview: "Wholesome spiced red lentil soup.",
    ingredients: ["Red lentils", "Cumin", "Turmeric", "Carrots", "Onions", "Vegetable broth", "Lemon wedge"]
  },
  { 
    id: "6", 
    title: "Roasted Veggies", 
    price: "$5.50", 
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=800", 
    category: "Sides", 
    description: "Seasonal vegetables roasted with herbs.",
    tags: ["V", "GF"],
    longDescription: "A colorful selection of seasonal vegetables tossed in olive oil and fresh herbs, then roasted until caramelized and tender.",
    overview: "Herb-roasted seasonal vegetables.",
    ingredients: ["Seasonal vegetables", "Extra virgin olive oil", "Fresh rosemary", "Sea salt", "Black pepper"]
  },
  { 
    id: "7", 
    title: "Classic Fries", 
    price: "$4.99", 
    image: menuDessert, 
    category: "Friendz Fries", 
    description: "Crispy shoestring fries tossed in sea salt.",
    tags: ["V", "GF"],
    longDescription: "Golden, crispy shoestring fries made from premium russet potatoes, double-fried for maximum crunch, and tossed with fine sea salt.",
    overview: "Golden crispy shoestring fries with sea salt.",
    ingredients: ["Russet potatoes", "Sunflower oil", "Fine sea salt", "Optional: house dipping sauce"]
  },
  { 
    id: "8", 
    title: "Loaded Vegan Fries", 
    price: "$8.50", 
    image: menuDessert, 
    category: "Friendz Fries", 
    description: "Fries topped with vegan cheese sauce, jalapeños, and facon bits.",
    tags: ["V"],
    longDescription: "Our crispy shoestring fries smothered in velvety cashew cheese sauce, spicy jalapeños, smoky facon bits, and a dollop of vegan sour cream.",
    overview: "Loaded fries with cashew cheese and smoky facon.",
    ingredients: ["Crispy fries", "Cashew cheese sauce", "Sliced jalapeños", "Coconut facon bits", "Vegan sour cream", "Green onions"]
  },
  { 
    id: "10", 
    title: "Iced Mocha Latte", 
    price: "$5.00", 
    image: menuLatte, 
    category: "Coffee & Tea", 
    description: "Rich espresso, chocolate syrup, and cold oat milk.",
    tags: ["V", "GF"],
    longDescription: "Double shots of rich espresso combined with house-made chocolate syrup, poured over ice and topped with creamy oat milk and cacao powder.",
    overview: "Iced coffee with espresso, chocolate, and oat milk.",
    ingredients: ["Double espresso", "House chocolate syrup", "Cold oat milk", "Ice", "Cacao powder"]
  },
  { 
    id: "11", 
    title: "Classic Mojito Mocktail", 
    price: "$4.75", 
    image: menuMojito, 
    category: "Mocktails", 
    description: "Fresh mint and lime blended into a refreshing mocktail.",
    tags: ["V", "GF"],
    longDescription: "Fresh mint leaves muddled with lime juice and agave nectar, topped with sparkling water and crushed ice for a refreshing, uplifting drink.",
    overview: "Refreshing mint and lime mocktail with sparkling water.",
    ingredients: ["Fresh mint leaves", "Fresh lime juice", "Agave nectar", "Sparkling water", "Crushed ice"]
  },
  { 
    id: "12", 
    title: "Sour Flowers", 
    price: "$6.25", 
    image: menuCoconut, 
    category: "Mocktails", 
    description: "A tart and floral refreshing mocktail.",
    tags: ["V", "GF"],
    longDescription: "Hibiscus tea blended with pomegranate juice and a hint of rose water, topped with sparkling water. Pretty, fragrant, and utterly refreshing.",
    overview: "Floral hibiscus and pomegranate sparkling mocktail.",
    ingredients: ["Hibiscus tea", "Pomegranate juice", "Rose water", "Agave nectar", "Sparkling water"]
  },
  { 
    id: "16", 
    title: "Beyond Kebab", 
    price: "$21", 
    image: beyondKebab, 
    category: "Main", 
    description: "Beyond kebab served wrapped or on a plate with pita bread, rice, and grilled veggies.",
    tags: ["V"],
    longDescription: "Seasoned Beyond Meat grilled to perfection and served on your choice of warm pita or a plate with aromatic rice and charred garden vegetables.",
    overview: "Grilled plant-based kebab served with Mediterranean sides.",
    ingredients: ["Beyond Meat kebab", "Aromatic rice or Pita", "Grilled bell peppers", "Grilled zucchini", "Garlic sauce"]
  },
  { 
    id: "18", 
    title: "Beetroot Falafel Burger", 
    price: "$18", 
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800", 
    category: "Main", 
    description: "Beetroot falafel patty, avocado, tomatoes, greens on a toasted bun.",
    tags: ["V"],
    longDescription: "A gorgeous deep-red falafel patty made with beetroot, toasted bun, creamy smashed avocado, ripe tomato slices, and a handful of fresh greens.",
    overview: "Vibrant beetroot falafel patty burger.",
    ingredients: ["Beetroot falafel patty", "Toasted vegan bun", "Smashed avocado", "Fresh tomatoes", "Mixed greens", "House sauce"]
  },
  { 
    id: "19", 
    title: "Quesadilla Trio", 
    price: "$20", 
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800", 
    category: "Main", 
    description: "Three soft quesadillas filled with vegan cheese and veggies.",
    tags: ["V"],
    longDescription: "Three perfectly grilled soft flour tortillas filled with melty vegan cheese and a colorful medley of sautéed vegetables.",
    overview: "Trio of grilled vegan quesadillas.",
    ingredients: ["Flour tortillas", "Vegan cheddar", "Bell peppers", "Onion", "Mushrooms", "House salsa"]
  },
  { 
    id: "20", 
    title: "Gyro Burger", 
    price: "$18", 
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800", 
    category: "Main", 
    description: "Gyro crumbles layered with tzatziki, lettuce, and red onions.",
    tags: ["V"],
    longDescription: "Seasoned seitan gyro crumbles piled into a toasted bun with cool vegan tzatziki, crisp lettuce, and sharp red onions.",
    overview: "Mediterranean-style gyro burger.",
    ingredients: ["Seitan gyro crumbles", "Vegan brioche bun", "Vegan tzatziki", "Romaine lettuce", "Red onions"]
  },
  { 
    id: "21", 
    title: "Gyro Wrap", 
    price: "$16", 
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", 
    category: "Main", 
    description: "Gyro seitan wrapped in pita bread with fresh veggies.",
    tags: ["V"],
    longDescription: "Our seitan gyro seasoned with authentic Mediterranean spices, wrapped in warm pita bread, with fresh veggies and creamy tzatziki.",
    overview: "Seitan gyro pita wrap.",
    ingredients: ["Seitan gyro", "Warm pita", "Vegan tzatziki", "Fresh tomatoes", "Cucumber", "Red onion"]
  },
  { 
    id: "22", 
    title: "Tofu Egg Salad Sandwich", 
    price: "$17", 
    image: "https://images.unsplash.com/photo-1620589125156-fd5028c5e05b?w=800", 
    category: "Main", 
    description: "Tofu, vegan mayo, dijon mustard, celery, and greens.",
    tags: ["V"],
    longDescription: "Crumbled silken tofu blended with vegan mayo, tangy dijon mustard, crisp celery, and turmeric kala namak for authentic egg-like flavor on thick-cut bread.",
    overview: "Creamy plant-based egg salad sandwich.",
    ingredients: ["Silken tofu", "Vegan mayo", "Dijon mustard", "Celery", "Kala namak", "Turmeric", "Thick-cut bread"]
  },
  { 
    id: "23", 
    title: "Tofu Egg Salad Tacos", 
    price: "$16", 
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800", 
    category: "Main", 
    description: "Tofu egg salad served in soft tacos.",
    tags: ["V"],
    longDescription: "Our beloved tofu egg salad nestled into warm soft taco shells, topped with fresh salsa and a squeeze of lime.",
    overview: "Plant-based egg salad in soft taco shells.",
    ingredients: ["Tofu egg salad", "Soft taco shells", "Fresh salsa", "Lime juice", "Cilantro"]
  },
  { 
    id: "24", 
    title: "Jackfruit Carnitas Tacos", 
    price: "$16", 
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800", 
    category: "Main", 
    description: "Spiced jackfruit carnitas served with lime and cilantro.",
    tags: ["V"],
    longDescription: "Young jackfruit slow-braised in Mexican spices until tender and caramelized. Served in warm tortillas with fresh cilantro, lime, and pico de gallo.",
    overview: "Slow-braised jackfruit carnitas tacos.",
    ingredients: ["Young jackfruit", "Mexican spice blend", "Corn tortillas", "Pico de gallo", "Fresh lime", "Cilantro"]
  },
  { 
    id: "25", 
    title: "Gyro Carnitas Tacos", 
    price: "$18", 
    image: gyroCarnitasTacos, 
    category: "Main", 
    description: "Vegan carnitas and gyro blend in tacos.",
    tags: ["V"],
    longDescription: "Our gyro seitan and jackfruit carnitas blend served in warm tortillas with tzatziki, fresh veggies, and a sprinkle of za'atar.",
    overview: "Fusion gyro-carnitas tacos.",
    ingredients: ["Seitan gyro", "Jackfruit carnitas", "Corn tortillas", "Vegan tzatziki", "Za'atar"]
  },
  { 
    id: "26", 
    title: "Just Egg Scramble", 
    price: "$17", 
    image: justEggScramble, 
    category: "Main", 
    description: "Plant-based egg scrambled with bell peppers and onions.",
    tags: ["V"],
    longDescription: "JUST Egg (mung bean-based) scrambled to fluffy perfection with sautéed bell peppers, onions, and herbs. Served with toasted sourdough.",
    overview: "Fluffy plant-based egg scramble.",
    ingredients: ["JUST Egg liquid", "Bell peppers", "Onions", "Chives", "Cherry tomatoes", "Toasted sourdough"]
  },
  { 
    id: "27", 
    title: "Baked Feta Pasta", 
    price: "$17", 
    image: "https://images.unsplash.com/photo-1626844131082-256783844137?w=800", 
    category: "Main", 
    description: "Oven baked vegan feta merged with cherry tomatoes and pasta.",
    tags: ["V"],
    longDescription: "A block of creamy vegan feta nestled in cherry tomatoes and baked until golden and bubbling. Tossed with al dente pasta and fresh basil.",
    overview: "Oven-baked vegan feta and tomato pasta.",
    ingredients: ["Penne pasta", "Vegan feta block", "Cherry tomatoes", "Fresh basil", "Garlic", "Olive oil"]
  },
  { 
    id: "28", 
    title: "Mediterranean Harvest Pasta", 
    price: "$17", 
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", 
    category: "Main", 
    description: "Pasta cooked with mediterranean veggies, olives, and olive oil.",
    tags: ["V"],
    longDescription: "Al dente pasta tossed with roasted vegetables, briny kalamata olives, sun-dried tomatoes, and premium olive oil. Finished with fresh herbs and lemon zest.",
    overview: "Vegetable-forward Mediterranean pasta.",
    ingredients: ["Linguine pasta", "Roasted zucchini", "Bell peppers", "Kalamata olives", "Sun-dried tomatoes", "Fresh basil"]
  },
  { 
    id: "29", 
    title: "Crispy Baked Mac N Cheese", 
    price: "$16", 
    image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800", 
    category: "Main", 
    description: "Classic macaroni baked in creamy vegan cheese sauce.",
    tags: ["V"],
    longDescription: "Elbow macaroni coated in ultra-creamy cashew-based cheese sauce and baked until the top is perfectly golden and crispy.",
    overview: "Cashew cheese mac baked to golden perfection.",
    ingredients: ["Elbow macaroni", "Cashew cheese sauce", "Nutritional yeast", "Breadcrumbs", "Smoked paprika", "Chives"]
  },
  { 
    id: "30", 
    title: "Berry Blast Mocktail", 
    price: "$5.50", 
    image: mocktailsCollection, 
    category: "Mocktails", 
    description: "A vibrant blend of fresh mixed berries, mint, and sparkling soda.",
    tags: ["V", "GF"],
    longDescription: "A dazzling fusion of fresh strawberries, blueberries, raspberries, and mint leaves, gently muddled and topped with sparkling soda and crushed ice. Bursting with natural fruit flavor and natural sweetness.",
    overview: "Fresh mixed berry mocktail with sparkling soda.",
    ingredients: ["Fresh strawberries", "Blueberries", "Raspberries", "Fresh mint", "Agave nectar", "Sparkling water", "Crushed ice"]
  },
  { 
    id: "31", 
    title: "Tropical Sunrise", 
    price: "$5.75", 
    image: mocktailsCollection, 
    category: "Mocktails", 
    description: "Layered tropical drink with mango, passion fruit, and orange juice.",
    tags: ["V", "GF"],
    longDescription: "A stunning layered mocktail featuring ripe mango puree, sweet passion fruit juice, and fresh-squeezed orange juice. The beautiful sunrise gradient makes it as gorgeous to look at as it is to drink.",
    overview: "Layered tropical fruit mocktail.",
    ingredients: ["Mango puree", "Passion fruit juice", "Fresh orange juice", "Grenadine", "Sparkling water", "Orange slice garnish"]
  },
  { 
    id: "32", 
    title: "Cucumber Mint Cooler", 
    price: "$5.25", 
    image: mocktailsCollection, 
    category: "Mocktails", 
    description: "Refreshing cucumber slices muddled with mint, lime, and sparkling water.",
    tags: ["V", "GF"],
    longDescription: "Cool and incredibly refreshing! Fresh cucumber slices are muddled with mint leaves and a squeeze of lime, then topped with chilled sparkling water. The ultimate palate cleanser and thirst quencher.",
    overview: "Cool cucumber and mint sparkling mocktail.",
    ingredients: ["Fresh cucumber", "Mint leaves", "Fresh lime juice", "Agave nectar", "Sparkling water", "Cucumber ribbon garnish"]
  },
  { 
    id: "33", 
    title: "Hot Matcha Latte", 
    price: "$5.50", 
    image: coffeTeaCollection, 
    category: "Coffee & Tea", 
    description: "Vibrant ceremonial matcha whisked with warm oat milk and a hint of vanilla.",
    tags: ["V", "GF"],
    longDescription: "Made with premium ceremonial-grade matcha powder, whisked to a smooth froth and blended with steamed oat milk and a touch of vanilla extract. A beautiful balance of earthy and sweet flavors.",
    overview: "Premium matcha latte with oat milk and vanilla.",
    ingredients: ["Ceremonial matcha powder", "Steamed oat milk", "Vanilla extract", "Agave syrup"]
  },
  { 
    id: "34", 
    title: "Caramel Macchiato", 
    price: "$5.75", 
    image: coffeTeaCollection, 
    category: "Coffee & Tea", 
    description: "Espresso with velvety oat foam and a generous caramel drizzle.",
    tags: ["V", "GF"],
    longDescription: "A layered espresso drink starting with velvety oat milk, topped with a double shot of rich espresso, and finished with a generous drizzle of house-made vegan caramel sauce. Sweet, bold, and utterly satisfying.",
    overview: "Layered oat milk espresso with caramel drizzle.",
    ingredients: ["Double espresso", "Steamed oat milk", "Oat milk foam", "Vegan caramel sauce"]
  },
  { 
    id: "35", 
    title: "Cold Brew Float", 
    price: "$6.50", 
    image: coffeTeaCollection, 
    category: "Coffee & Tea", 
    description: "Smooth cold brew coffee topped with a scoop of vanilla oat ice cream.",
    tags: ["V", "GF"],
    longDescription: "Our house-made cold brew is steeped for 18 hours for maximum smoothness and flavor. Served over ice and crowned with a generous scoop of creamy vanilla oat ice cream that slowly melts into the coffee.",
    overview: "18-hour cold brew topped with vanilla oat ice cream.",
    ingredients: ["18-hour cold brew", "Vanilla oat ice cream", "Ice", "Optional: oat milk"]
  },
  { 
    id: "36", 
    title: "Chocolate Lava Cake", 
    price: "$11.00", 
    image: dessertsCollection, 
    category: "Desserts", 
    description: "Rich chocolate hazelnut cake with a warm molten center.",
    tags: ["V"],
    longDescription: "Our signature vegan chocolate lava cake is a true showstopper. A rich dark chocolate hazelnut cake baked to perfection with a warm, gooey molten center that flows beautifully when you cut in. Served with a scoop of vanilla bean oat ice cream.",
    overview: "Decadent chocolate cake with warm molten center.",
    ingredients: ["Dark chocolate", "Hazelnut butter", "Coconut oil", "Flax egg", "Oat flour", "Vanilla oat ice cream"]
  },
  { 
    id: "37", 
    title: "Mango Sorbet", 
    price: "$7.00", 
    image: dessertsCollection, 
    category: "Desserts", 
    description: "Refreshing tropical mango sorbet served in a coconut shell.",
    tags: ["V", "GF"],
    longDescription: "Sunshine in a bowl! Our mango sorbet is made from Alphonso mangoes blended with a touch of lime juice and a hint of chili for a sweet-tangy kick. Scooped and served in a natural coconut shell for a beautiful tropical presentation.",
    overview: "Tropical Alphonso mango sorbet in a coconut shell.",
    ingredients: ["Alphonso mangoes", "Fresh lime juice", "Agave nectar", "Hint of chili", "Mint garnish"]
  },
  { 
    id: "38", 
    title: "Berry Cheesecake", 
    price: "$9.00", 
    image: dessertsCollection, 
    category: "Desserts", 
    description: "Creamy vegan cheesecake topped with fresh mixed berries and coulis.",
    tags: ["V"],
    longDescription: "A silky smooth cashew-based cheesecake set on a crunchy date-nut crust. Topped with a vibrant arrangement of fresh seasonal berries and a house-made berry coulis drizzle. Rich, tangy, and completely dairy-free.",
    overview: "Cashew cheesecake with fresh berries and coulis.",
    ingredients: ["Cashew cream base", "Date-nut crust", "Fresh strawberries", "Blueberries", "Raspberries", "Berry coulis"]
  },
  { 
    id: "39", 
    title: "Roasted Tomato Bisque", 
    price: "$7.50", 
    image: soupsCollection, 
    category: "Soups", 
    description: "Velvety roasted tomato soup with a cream swirl and fresh basil.",
    tags: ["V", "GF"],
    longDescription: "Ripe tomatoes are slow-roasted until caramelized and deeply flavored, then blended smooth with aromatic garlic and onions. Finished with a swirl of cashew cream and a generous handful of fresh basil. Serve with crusty bread.",
    overview: "Slow-roasted tomato soup with cashew cream.",
    ingredients: ["Roasted Roma tomatoes", "Roasted garlic", "Caramelized onions", "Cashew cream", "Fresh basil", "Olive oil"]
  },
  { 
    id: "40", 
    title: "Mushroom Cream Soup", 
    price: "$8.00", 
    image: soupsCollection, 
    category: "Soups", 
    description: "Rich, creamy mushroom soup with a drizzle of truffle oil.",
    tags: ["V", "GF"],
    longDescription: "A luxurious and deeply savory mushroom soup made from a medley of cremini, shiitake, and porcini mushrooms. Blended with oat cream until velvety smooth and finished with an elegant drizzle of white truffle oil.",
    overview: "Luxurious three-mushroom soup with truffle oil.",
    ingredients: ["Cremini mushrooms", "Shiitake mushrooms", "Porcini mushrooms", "Oat cream", "White truffle oil", "Fresh thyme"]
  },
  { 
    id: "41", 
    title: "Mediterranean Minestrone", 
    price: "$7.00", 
    image: soupsCollection, 
    category: "Soups", 
    description: "Hearty minestrone loaded with seasonal vegetables and herbs.",
    tags: ["V", "GF"],
    longDescription: "A hearty and nourishing minestrone brimming with seasonal vegetables, cannellini beans, and Mediterranean herbs, simmered in a rich tomato broth. Naturally gluten-free and deeply satisfying.",
    overview: "Hearty Mediterranean vegetable and bean soup.",
    ingredients: ["Cannellini beans", "Zucchini", "Carrots", "Celery", "Crushed tomatoes", "Vegetable broth", "Fresh herbs"]
  },
  { 
    id: "42", 
    title: "Truffle Parmesan Fries", 
    price: "$9.50", 
    image: friesCollection, 
    category: "Friendz Fries", 
    description: "Crispy fries drizzled with truffle oil and shaved vegan parmesan.",
    tags: ["V"],
    longDescription: "Our crispiest fries, elevated to fine dining status. Freshly fried golden shoestring fries are drizzled with premium white truffle oil while still hot, then topped with a generous shaving of vegan parmesan and fresh parsley. A luxurious indulgence.",
    overview: "Gourmet fries with truffle oil and vegan parmesan.",
    ingredients: ["Shoestring fries", "White truffle oil", "Vegan parmesan shavings", "Fresh parsley", "Sea salt"]
  },
  { 
    id: "43", 
    title: "Sweet Potato Fries", 
    price: "$7.00", 
    image: friesCollection, 
    category: "Friendz Fries", 
    description: "Golden sweet potato fries served with a smoky chipotle dipping sauce.",
    tags: ["V", "GF"],
    longDescription: "Golden, naturally sweet, and perfectly crispy sweet potato fries, oven-baked for a healthier twist. Served with our house-made smoky chipotle mayo dipping sauce that perfectly complements the natural sweetness.",
    overview: "Crispy sweet potato fries with chipotle dipping sauce.",
    ingredients: ["Sweet potatoes", "Sunflower oil", "Smoked paprika", "Sea salt", "Vegan chipotle mayo"]
  },
  { 
    id: "44", 
    title: "Peri-Peri Fries", 
    price: "$7.50", 
    image: friesCollection, 
    category: "Friendz Fries", 
    description: "Crispy fries tossed in bold peri-peri spice blend with a cooling mint dip.",
    tags: ["V", "GF"],
    longDescription: "For the spice lovers! Our crispy fries are tossed while hot in our house-made peri-peri spice blend, bringing bold, smoky, and spicy African flavors to every bite. Served with a refreshing cooling mint yogurt dip.",
    overview: "Spiced peri-peri fries with cooling mint dip.",
    ingredients: ["Shoestring fries", "Peri-peri spice blend", "Smoked paprika", "Cayenne", "Vegan mint yogurt dip"]
  },
];

const MenuDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const item = allMenuItems.find((m) => m.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary relative overflow-hidden">
        <Navbar />
        <div className="pt-40 pb-20 text-center relative z-10">
          <h1 className="text-8xl font-serif font-bold text-primary-foreground mb-8" style={{ letterSpacing: "-0.04em" }}>
            Item Not Found
          </h1>
          <Link to="/menu" className="btn-gold inline-flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" /> Back to Menu
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedItems = allMenuItems.filter((m) => m.id !== id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-40 pb-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[0%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold px-6 py-2.5 rounded-full"
                  style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}>
              {item.category}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-primary-foreground leading-[0.9] mb-8"
            style={{ letterSpacing: "-0.04em" }}
          >
            {item.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary-foreground/50 max-w-xl mx-auto text-[18px] leading-[1.8]"
          >
            {item.description}
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="-mt-16 pb-24 relative z-20">
        <div className="container mx-auto px-6 md:px-12">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto mb-20"
          >
            <div className="relative overflow-hidden shadow-2xl" style={{ borderRadius: "3rem" }}>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[500px] md:h-[650px] object-cover transition-transform [transition-duration:2s] hover:scale-105"
              />
            </div>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-12 gap-12 lg:gap-20">
                <div className="md:col-span-8 h-fit bg-white p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[2.5rem] border border-black/5">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold mb-5 flex items-center gap-2"
                        style={{ color: "hsl(43 74% 48%)" }}>
                    <span className="text-lg leading-none mt-[-2px]">+</span> THE STORY
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8"
                      style={{ letterSpacing: "-0.02em" }}>
                    About This <span className="italic font-medium" style={{ color: "hsl(43 74% 48%)" }}>Dish</span>
                  </h2>
                  <div className="text-[#64748b] leading-[1.8] text-[15px] md:text-[16px] font-medium whitespace-pre-line mb-16">
                    {item.longDescription || item.description || "A comforting and elegant dish prepared with the finest ingredients and spices. Rich in flavor and texture, it represents a perfect culinary experience."}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-6">
                    Overview
                  </h3>
                  <p className="text-[#64748b] leading-[1.8] text-[15px] md:text-[16px] font-medium mb-4">
                    {item.overview || "A wholesome and delightful addition to your meal."}
                  </p>
                </div>
                
                <div className="md:col-span-4 sticky top-32 flex flex-col gap-6 self-start">
                  {/* Single Unified Sidebar Box */}
                  <div className="bg-white p-5 md:p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] rounded-2xl border border-black/5">
                    
                    {/* Price Section */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Price</span>
                      <span className="text-2xl font-serif font-bold" style={{ color: "hsl(43 74% 48%)" }}>
                        {item.price}
                      </span>
                    </div>

                    {/* Ingredients Section */}
                    <div className="mb-4 pb-4 border-b border-black/5">
                      <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary mb-3">
                        Key Ingredients
                      </h3>
                      <ul className="space-y-2">
                        {item.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(43 74% 48%)" }} />
                            <span className="text-slate-500 text-[13px] font-medium leading-snug">{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quantity Section */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary">Quantity</span>
                      <div className="flex items-center gap-3 bg-[hsl(40_18%_96%)] rounded-lg p-1 border border-black/5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-black/5 active:scale-95 transition-all text-primary"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-base text-primary w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-[hsl(43_74%_48%)] shadow-sm hover:brightness-110 active:scale-95 transition-all text-[hsl(195_30%_8%)]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                          addToCart({
                            id: Number(item.id),
                            title: item.title,
                            price: isNaN(numericPrice) ? 0 : numericPrice,
                            priceStr: item.price,
                            image: item.image,
                            quantity: quantity
                          });
                          setQuantity(1); // Reset quantity after adding
                        }}
                        className="w-full bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-3 rounded-xl shadow-[0_6px_16px_rgba(228,168,32,0.3)] hover:shadow-[0_8px_20px_rgba(228,168,32,0.4)] hover:-translate-y-0.5 transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>

                      <Link
                        to="/checkout"
                        className="w-full bg-[#1b2534] text-white font-bold py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 border border-white/5"
                      >
                        View Cart
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Items */}
      <section className="section-divide relative" style={{ background: "hsl(38 15% 92% / 0.3)" }}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-4 block"
                    style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                ✦ Related
              </span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-primary" style={{ letterSpacing: "-0.04em" }}>
                More from our <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Menu</span>
              </h2>
            </div>
            <Link
              to="/menu"
              className="hidden md:inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 group"
              style={{ color: "hsl(43 74% 48%)" }}
            >
              Full Menu
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {relatedItems.map((item, index) => {
              const shapeClass = getShapeClass(index);
              
              return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="group h-full"
              >
                <Link to={`/menu/${item.id}`} className="block h-full">
                  <div className="flex flex-col items-center bg-transparent group mb-12 cursor-pointer h-full hoverable">
                    <div className={`relative overflow-hidden aspect-square w-full max-w-[260px] mx-auto mb-6 transition-transform duration-500 group-hover:scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white border border-black/5 ${shapeClass}`}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-primary/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                      
                      {/* Custom geometric inner border imitating the client's reference images */}
                      <div className={`absolute inset-[8px] pointer-events-none custom-card-border ${shapeClass} overflow-visible`}>
                        <div className={`absolute inset-0 border-[1.5px] border-white/80 ${shapeClass}`} />
                        
                        {/* Diamond accent icons on corners */}
                        <DiamondStar className="absolute -top-1.5 -left-1.5 w-3 h-3 text-zinc-800 drop-shadow-md bg-white border border-white" />
                        <DiamondStar className="absolute -top-1.5 -right-1.5 w-3 h-3 text-zinc-400 drop-shadow-md bg-white border border-white" />
                        <DiamondStar className="absolute -bottom-1.5 -left-1.5 w-3 h-3 text-zinc-800 drop-shadow-md bg-white border border-white" />
                        <DiamondStar className="absolute -bottom-1.5 -right-1.5 w-3 h-3 text-[hsl(43_74%_48%)] drop-shadow-md bg-zinc-900 border border-zinc-900" />
                      </div>
                      
                      {/* Tags */}
                      {((item as any).tags && (item as any).tags.length > 0) && (
                        <div className="absolute top-6 right-6 flex gap-2 z-10 flex-col">
                          {(item as any).tags.map((tag: string) => (
                            <span key={tag} className="bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm text-center">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-primary mb-3 text-center transition-colors group-hover:text-[hsl(43_74%_48%)] px-2">
                      {item.title} <span className="font-serif font-bold tracking-tight text-xl ml-1">{item.price}</span>
                    </h3>
                    <p className="text-[13px] md:text-[14px] text-center text-primary/80 leading-relaxed px-4 md:px-8 mb-4 font-medium line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="mt-auto px-4 md:px-8 w-full flex flex-col gap-3 pb-2 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                          addToCart({
                            id: Number(item.id),
                            title: item.title,
                            price: isNaN(numericPrice) ? 0 : numericPrice,
                            priceStr: item.price,
                            image: item.image,
                          });
                        }}
                        className="flex items-center justify-center gap-2 bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] w-full py-2.5 rounded-full text-[11px] uppercase tracking-[0.1em] font-bold shadow-[0_4px_14px_rgba(228,168,32,0.3)] hover:scale-105 hover:bg-[hsl(43_74%_48%)]/90 transition-all z-20"
                      >
                        <ShoppingCart size={15} />
                        Add to Cart
                      </button>
                      
                      <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[hsl(43_74%_48%)] group-hover:text-primary transition-colors duration-300">
                        View Details 
                        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MenuDetail;
