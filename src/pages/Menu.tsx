import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import menuMojito from "@/assets/menu-mojito.jpg";
import menuCoconut from "@/assets/menu-coconut.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import menuDessert from "@/assets/menu-dessert.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import heroFood from "@/assets/hero-food.jpg";

const categories = ["All Menu", "Veg", "Non-Veg", "Drinks"];

const allMenuItems = [
  {
    id: 1,
    title: "BBQ Grilled Ribs",
    price: "$18.99",
    image: heroFood,
    category: "Non-Veg",
    description: "To die-for meat recipe for ribs, our BBQ ribs! Ribs are glazed with a savory-sweet barbecue.",
  },
  {
    id: 2,
    title: "Classic Mojito",
    price: "$4.75",
    image: menuMojito,
    category: "Drinks",
    description: "This cocktail blends minty fresh mint and white rum with a refreshing drink.",
  },
  {
    id: 3,
    title: "Coconut Drinks Fizz",
    price: "$4.25",
    image: menuCoconut,
    category: "Drinks",
    description: "A tropical delight, the Pineapple Coconut Fizz combines sweet tropical vibes with a creamy coconut.",
  },
  {
    id: 4,
    title: "Garlic Butter Shrimp",
    price: "$14.99",
    image: menuShrimp,
    category: "Non-Veg",
    description: "Succulent shrimp seared in savory garlic butter sauce served on a bed of linguine pasta.",
  },
  {
    id: 5,
    title: "Golden Bliss",
    price: "$10.00",
    image: menuDessert,
    category: "Veg",
    description: "A decadent golden creation that balances the perfect balance of flavors and textures for a truly gratifying.",
  },
  {
    id: 6,
    title: "Iced Mocha Latte",
    price: "$5.00",
    image: menuLatte,
    category: "Drinks",
    description: "A delightful mix of rich espresso, chocolate syrup, and cold milk, topped with whipped cream.",
  },
  {
    id: 7,
    title: "Jerk Chicken",
    price: "$12.49",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
    category: "Non-Veg",
    description: "Our Jerk Chicken is a new recipe we've created to bring Caribbean spices, marinated to perfection.",
  },
  {
    id: 8,
    title: "Lamb Rogan Josh",
    price: "$16.99",
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=600",
    category: "Non-Veg",
    description: "Experience the rich flavors of lamb Rogan Josh, a traditional Indian curry.",
  },
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("All Menu");

  const filteredItems = activeCategory === "All Menu"
    ? allMenuItems
    : allMenuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-serif font-bold text-primary-foreground mb-4"
          >
            Taste the World
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary-foreground/70 max-w-2xl mx-auto"
          >
            At Craving, we believe that food should be a delightful journey. Our menu
            features a wide variety of dishes, carefully crafted to excite.
          </motion.p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                  activeCategory === category
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent/20"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Menu Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="menu-card group"
              >
                <Link to={`/menu/${item.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="text-accent font-bold text-lg">{item.price}</span>
                      <span className="category-tag">{item.category}</span>
                    </div>
                  </div>
                </Link>

                <div className="p-6">
                  <Link to={`/menu/${item.id}`}>
                    <h3 className="text-xl font-serif font-bold text-primary mb-2 hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <button className="flex items-center gap-2 text-accent font-medium text-sm hover:gap-3 transition-all">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-forest-light transition-colors">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl md:text-8xl font-serif font-bold text-primary-foreground/20">
              Craving
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Menu;
