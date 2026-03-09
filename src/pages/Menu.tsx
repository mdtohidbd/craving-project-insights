import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useCart } from "@/context/CartContext";

// ... existing imports

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

const categories = [
  "Starters",
  "Main",
  "Soups",
  "Sides",
  "Friendz Fries",
  "Desserts",
  "Coffee & Tea",
  "Mocktails",
];

// Reusing same allMenuItems as before...
const allMenuItems = [
  { id: 1, title: "Beet Avocado Toast", price: "$13.00", image: beetAvocadoToast, category: "Starters", description: "Beetroot hummus, avocado, pickled red onions, olive oil, sprinkled with everything bagel seasoning.", tags: ["GF"] },
  { id: 2, title: "Guacamole", price: "$10.00", image: guacamoleBowl, category: "Starters", description: "Choice of pita chips or corn chips.", tags: ["GF"] },
  { id: 13, title: "Loaded Cheese Nachos", price: "$14.00", image: loadedCheeseNachos, category: "Starters", description: "Corn chips loaded with cheese sauce, black beans, pickled red onions, tomatoes, green onions." },
  { id: 3, title: "BYO Pita Wrap or Bowl", price: "$14", image: byoPitaWrap, category: "Main", description: "Choice of hummus, Cucumber, tomatoes, pickled red onions, mint, parsley, tahini, and pita. Add proteins below / Gluten free if bowl +$2", tags: ["V"], allergens: "Contains wheat (pita). Gluten-free if bowl." },
  { id: 14, title: "Tabbouleh Bowl", price: "$16", image: tabboulehBowl, category: "Main", description: "Tabbouleh salad, hummus, cucumber, plum tomatoes, pickles and tahini.", tags: ["V"], allergens: "Contains wheat." },
  { id: 15, title: "Original Falafel Wrap", price: "$13", image: originalFalafelWrap, category: "Main", description: "Hummus, cucumber, pickles, tomatoes, red onions, mint, parsley, tahini.", tags: ["V"], allergens: "Contains wheat." },
  { id: 16, title: "Beyond Kebab", price: "$21", image: beyondKebab, category: "Main", description: "Beyond kebab served wrapped or on a plate with pita bread, rice, and grilled veggies.", tags: ["V"], allergens: "Contains wheat." },
  { id: 17, title: "Desi Falafel Plate", price: "$16", image: desiFalafelPlate, category: "Main", description: "Falafel, hummus, cucumber, chopped tomatoes, and a grilled green chili.", tags: ["V", "GF"], allergens: "Contains sesame." },
  { id: 4, title: "Beyond Burger", price: "$18", image: beyondBurger, category: "Main", description: "Beyond burger patty, lettuce, tomatoes, and pickled pink onions.", tags: ["V"], allergens: "Contains wheat, soy." },
  { id: 18, title: "Beetroot Falafel Burger", price: "$18", image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600", category: "Main", description: "Beetroot falafel patty, avocado, tomatoes, greens on a toasted bun.", tags: ["V"], allergens: "Contains wheat." },
  { id: 19, title: "Quesadilla Trio", price: "$20", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600", category: "Main", description: "Three soft quesadillas filled with vegan cheese and veggies.", tags: ["V"], allergens: "Contains wheat." },
  { id: 20, title: "Gyro Burger", price: "$18", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600", category: "Main", description: "Gyro crumbles layered with tzatziki, lettuce, and red onions.", tags: ["V"], allergens: "Contains wheat, soy." },
  { id: 21, title: "Gyro Wrap", price: "$16", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600", category: "Main", description: "Gyro seitan wrapped in pita bread with fresh veggies.", tags: ["V"], allergens: "Contains wheat, soy." },
  { id: 22, title: "Tofu 'Egg' Salad Sandwich", price: "$17", image: "https://images.unsplash.com/photo-1620589125156-fd5028c5e05b?w=600", category: "Main", description: "Tofu, vegan mayo, dijon mustard, celery, and greens.", tags: ["V"], allergens: "Contains soy, wheat." },
  { id: 23, title: "Tofu 'Egg' Salad Tacos", price: "$16", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600", category: "Main", description: "Tofu egg salad served elegantly in soft tacos.", tags: ["V"], allergens: "Contains soy." },
  { id: 24, title: "Jackfruit 'Carnitas' Tacos", price: "$16", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600", category: "Main", description: "Spiced jackfruit carnitas served with lime and cilantro.", tags: ["V"], allergens: "Contains soy." },
  { id: 25, title: "Gyro 'Carnitas' Tacos", price: "$18", image: gyroCarnitasTacos, category: "Main", description: "Vegan carnitas and gyro blend in tacos.", tags: ["V"], allergens: "Contains soy, wheat." },
  { id: 26, title: "Just Egg Scramble", price: "$17", image: justEggScramble, category: "Main", description: "Plant-based egg scrambled with bell peppers and onions.", tags: ["V"], allergens: "Contains soy." },
  { id: 27, title: "Baked Feta Pasta", price: "$17", image: "https://images.unsplash.com/photo-1626844131082-256783844137?w=600", category: "Main", description: "Oven baked vegan feta merged with cherry tomatoes and pasta.", tags: ["V"], allergens: "Contains wheat." },
  { id: 28, title: "Mediterranean Harvest Pasta", price: "$17", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600", category: "Main", description: "Pasta cooked with mediterranean veggies, olives, and olive oil.", tags: ["V"], allergens: "Contains wheat." },
  { id: 29, title: "Crispy Baked Mac 'N Cheese", price: "$16", image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600", category: "Main", description: "Classic macaroni baked in creamy vegan cheese sauce.", tags: ["V"], allergens: "Contains wheat, cashew." },
  { id: 5, title: "Lentil Soup", price: "$6.99", image: menuShrimp, category: "Soups", description: "Hearty and warming spiced lentil soup.", tags: ["V", "GF"] },
  { id: 6, title: "Roasted Veggies", price: "$5.50", image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=600", category: "Sides", description: "Seasonal vegetables roasted with herbs.", tags: ["V", "GF"] },
  { id: 7, title: "Classic Fries", price: "$4.99", image: menuDessert, category: "Friendz Fries", description: "Crispy shoestring fries tossed in sea salt.", tags: ["V", "GF"] },
  { id: 8, title: "Loaded Vegan Fries", price: "$8.50", image: menuDessert, category: "Friendz Fries", description: "Fries topped with vegan cheese sauce, jalapeños, and facon bits.", tags: ["V"], allergens: "Contains cashew (cheese sauce), soy." },
  { id: 9, title: "Golden Bliss Vegan Cake", price: "$10.00", image: menuDessert, category: "Desserts", description: "A decadent golden creation balancing perfect flavors and textures.", tags: ["V", "GF"], allergens: "Contains almond." },
  { id: 10, title: "Iced Mocha Latte", price: "$5.00", image: menuLatte, category: "Coffee & Tea", description: "Rich espresso, chocolate syrup, and cold oat milk.", tags: ["V", "GF"] },
  { id: 11, title: "Classic Mojito Mocktail", price: "$4.75", image: menuMojito, category: "Mocktails", description: "Fresh mint and lime blended into a refreshing mocktail.", tags: ["V", "GF"] },
  { id: 12, title: "Sour Flowers", price: "$6.25", image: menuCoconut, category: "Mocktails", description: "A tart and floral refreshing mocktail.", tags: ["V", "GF"] },
];

const toId = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const Menu = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register scroll trigger with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Animate all menu cards beautifully
    const cards = document.querySelectorAll('.gsap-menu-card');
    
    cards.forEach((card, i) => {
      gsap.fromTo(card, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Cleanup scroll hints
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let currentCategory = categories[0];
      for (const cat of categories) {
        const id = toId(cat);
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 250) {
            currentCategory = cat;
          }
        }
      }
      setActiveCategory(currentCategory);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(toId(category));
    if (element) {
      const yOffset = -200; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(40_18%_96%)]" ref={containerRef}>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-40 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10 hoverable">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.9] mb-6"
            style={{ color: "hsl(40 20% 96%)", letterSpacing: "-0.04em" }}
          >
            Our
            <br />
            <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Menu</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <a href="/JustFade_Menu.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-sm uppercase tracking-widest backdrop-blur-md">
              <FileText size={16} />
              Quick View PDF
            </a>
          </motion.div>
        </div>
      </section>

      {/* Sticky Category Nav */}
      <div className="sticky top-24 z-40 bg-[hsl(40_18%_96%)]/95 backdrop-blur-xl border-b border-primary/10 shadow-sm py-4">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex overflow-x-auto gap-3 md:gap-6 hide-scrollbar justify-start md:justify-center items-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[12px] uppercase tracking-[0.2em] font-medium transition-all duration-300 hoverable ${
                  activeCategory === category
                    ? "shadow-md transform scale-105"
                    : "hover:bg-primary/5 hover:transform hover:scale-105"
                }`}
                style={
                  activeCategory === category
                    ? {
                        background: "hsl(43 74% 48%)",
                        color: "hsl(195 30% 8%)",
                        border: "1px solid hsl(43 74% 48%)",
                        fontWeight: "bold"
                      }
                    : {
                        background: "transparent",
                        color: "hsl(195 30% 12% / 0.7)",
                        border: "1px solid hsl(38 12% 88%)",
                      }
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Categories Array */}
      <div className="container mx-auto px-6 md:px-12 pb-32">
        {categories.map((category) => {
          const categoryItems = allMenuItems.filter((item) => item.category === category);
          
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} id={toId(category)} className="pt-24 pb-12 border-b border-primary/10 last:border-0 scroll-mt-32">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-4xl md:text-5xl font-serif font-bold text-primary mb-12 text-center"
              >
                {category}
              </motion.h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {categoryItems.map((item, index) => {
                  const shapeClass = getShapeClass(index);
                  
                  return (
                    <Link
                      key={item.id}
                      to={`/menu/${item.id}`}
                      className="group gsap-menu-card opacity-0 block h-full"
                    >
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
                          {(item.tags && item.tags.length > 0) && (
                            <div className="absolute top-6 right-6 flex gap-2 z-10 flex-col">
                              {item.tags.map((tag) => (
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
                                id: item.id,
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

                        {item.allergens && (
                          <p className="mt-4 text-[11px] md:text-[12px] text-center text-primary/60 italic max-w-[280px]">
                            {item.allergens}
                          </p>
                        )}
                      </div>
                    </Link>
                )})}
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
};

export default Menu;
