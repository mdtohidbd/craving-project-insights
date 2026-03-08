import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import menuMojito from "@/assets/menu-mojito.jpg";
import menuCoconut from "@/assets/menu-coconut.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import menuDessert from "@/assets/menu-dessert.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import heroFood from "@/assets/hero-food.jpg";

const categories = ["All", "Grill", "Seafood", "Drinks", "Dessert"];

const allMenuItems = [
  {
    id: 1,
    title: "BBQ Grilled Ribs",
    price: "$18.99",
    image: heroFood,
    category: "Grill",
    description: "Ribs glazed with savory-sweet barbecue sauce, caramelized beautifully.",
  },
  {
    id: 2,
    title: "Classic Mojito",
    price: "$4.75",
    image: menuMojito,
    category: "Drinks",
    description: "Fresh mint and white rum blended into a refreshing cocktail.",
  },
  {
    id: 3,
    title: "Coconut Fizz",
    price: "$4.25",
    image: menuCoconut,
    category: "Drinks",
    description: "Sweet tropical vibes with creamy coconut and sparkling fizz.",
  },
  {
    id: 4,
    title: "Garlic Butter Shrimp",
    price: "$14.99",
    image: menuShrimp,
    category: "Seafood",
    description: "Succulent shrimp seared in savory garlic butter sauce.",
  },
  {
    id: 5,
    title: "Golden Bliss",
    price: "$10.00",
    image: menuDessert,
    category: "Dessert",
    description: "A decadent golden creation balancing perfect flavors and textures.",
  },
  {
    id: 6,
    title: "Iced Mocha Latte",
    price: "$5.00",
    image: menuLatte,
    category: "Drinks",
    description: "Rich espresso, chocolate syrup, and cold milk with whipped cream.",
  },
  {
    id: 7,
    title: "Jerk Chicken",
    price: "$12.49",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
    category: "Grill",
    description: "Caribbean spiced chicken, marinated and grilled to perfection.",
  },
  {
    id: 8,
    title: "Lamb Rogan Josh",
    price: "$16.99",
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=600",
    category: "Grill",
    description: "Rich flavors of traditional Kashmiri lamb curry.",
  },
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? allMenuItems
      : allMenuItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-40 pb-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
            style={{ color: "hsl(43 74% 48% / 0.8)" }}
          >
            ✦ Culinary Collection
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-8xl lg:text-9xl font-serif font-bold leading-[0.9] mb-8"
            style={{ color: "hsl(40 20% 96%)", letterSpacing: "-0.04em" }}
          >
            Taste the
            <br />
            <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>World</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl mx-auto text-[18px] leading-[1.8]"
            style={{ color: "hsl(40 20% 96% / 0.5)" }}
          >
            Every dish is a carefully crafted journey designed to excite your palate
            and create unforgettable dinner memories.
          </motion.p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="section-divide relative" style={{ background: "hsl(40 18% 96%)" }}>
        <div className="container mx-auto px-6 md:px-12">
          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-20"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-3.5 rounded-full text-[12px] uppercase tracking-[0.2em] font-medium transition-all duration-500 shadow-sm ${
                  activeCategory === category
                    ? "bg-accent shadow-lg scale-105 bg-accent"
                    : "bg-white hover:bg-white hover:shadow-md"
                }`}
                style={
                  activeCategory === category
                    ? { background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)", border: "1px solid hsl(43 74% 48%)" }
                    : { background: "hsl(40 20% 96%)", color: "hsl(195 30% 12% / 0.7)", border: "1px solid hsl(38 12% 88%)" }
                }
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Menu Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group"
                >
                  <Link to={`/menu/${item.id}`} className="block h-full">
                    <div className="menu-card h-full">
                      <div className="relative overflow-hidden aspect-[4/3]" style={{ borderRadius: "1.5rem" }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-5 left-5 z-10">
                          <span className="category-tag shadow-sm backdrop-blur-md">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 z-10">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                               style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}>
                            <ArrowUpRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-7">
                        <div className="flex items-start justify-between gap-5 mb-3">
                          <h3 className="text-2xl font-serif font-bold text-card-foreground transition-colors duration-300 group-hover:text-accent group-hover:opacity-90">
                            {item.title}
                          </h3>
                          <span className="font-serif font-bold text-xl italic" style={{ color: "hsl(43 74% 48%)" }}>
                            {item.price}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[15px] leading-[1.7] opacity-90 line-clamp-2 pr-4">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Brand Section */}
      <section className="relative py-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-primary/95" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-8xl md:text-[14rem] font-serif font-bold text-primary-foreground/[0.04] italic select-none leading-none tracking-tighter"
                  style={{ letterSpacing: "-0.05em" }}>
              Craving
            </span>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Menu;
