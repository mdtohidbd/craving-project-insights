import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

import menuMojito from "@/assets/menu-mojito.jpg";
import menuCoconut from "@/assets/menu-coconut.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import menuDessert from "@/assets/menu-dessert.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import heroFood from "@/assets/hero-food.jpg";

const menuItems = [
  {
    id: 1,
    title: "BBQ Grilled Ribs",
    price: "$18.99",
    image: heroFood,
    category: "Grill",
    description: "Ribs glazed with a savory-sweet barbecue sauce, caramelized to perfection.",
  },
  {
    id: 2,
    title: "Classic Mojito",
    price: "$4.75",
    image: menuMojito,
    category: "Cocktail",
    description: "Fresh mint and white rum blended into a refreshing delight.",
  },
  {
    id: 3,
    title: "Coconut Fizz",
    price: "$4.25",
    image: menuCoconut,
    category: "Beverage",
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
    description: "A decadent golden creation balancing flavors and textures.",
  },
  {
    id: 6,
    title: "Iced Mocha Latte",
    price: "$5.00",
    image: menuLatte,
    category: "Coffee",
    description: "Rich espresso, chocolate syrup, and cold milk topped with cream.",
  },
];

const MenuSection = () => {
  const { addToCart } = useCart();

  return (
    <section className="section-divide bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.03), transparent 70%)" }} />
           
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
                style={{ color: "hsl(43 74% 48% / 0.8)" }}>
            ✦ Our Signature Collection
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary mb-8 leading-[0.9]"
              style={{ letterSpacing: "-0.04em" }}>
            Curated
            <br />
            <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Flavors</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-[1.8]">
            Every dish is a journey — handcrafted with the finest ingredients
            and presented as edible art.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group"
            >
              <Link to={`/menu/${item.id}`} className="block h-full">
                <div className="menu-card h-full flex flex-col">
                  <div className="relative overflow-hidden aspect-[4/3]" style={{ borderRadius: "1.5rem" }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform [transition-duration:1.5s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute top-5 left-5 z-10">
                      <span className="category-tag shadow-sm backdrop-blur-md">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 z-10 pointer-events-none">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                           style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}>
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-5 mb-3">
                      <h3 className="text-2xl font-serif font-bold text-card-foreground transition-colors duration-300 group-hover:text-accent group-hover:opacity-90">
                        {item.title}
                      </h3>
                      <span className="font-serif font-bold text-xl italic" style={{ color: "hsl(43 74% 48%)" }}>
                        {item.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[15px] leading-[1.7] opacity-90 mb-6">
                      {item.description}
                    </p>
                    <div className="mt-auto">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                          addToCart({
                            id: item.id,
                            title: item.title,
                            price: isNaN(numericPrice) ? 0 : numericPrice,
                            priceStr: item.price,
                            image: item.image,
                          });
                        }}
                        className="flex items-center justify-center gap-2 bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] w-full py-2.5 rounded-full text-[12px] uppercase tracking-[0.1em] font-bold shadow-[0_4px_14px_rgba(228,168,32,0.3)] hover:scale-105 hover:bg-[hsl(43_74%_48%)]/90 transition-all z-20"
                      >
                        <ShoppingCart size={15} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-20"
        >
          <Link to="/menu" className="btn-outline-gold inline-flex items-center gap-3 group">
            Explore Full Menu
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MenuSection;
