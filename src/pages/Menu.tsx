import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, ShoppingCart, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useCart } from "@/context/CartContext";
import { MenuItem } from "@/types";
import { applyCustomImages } from "@/utils/menuUtils";

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
import dessertsCollection from "@/assets/desserts_collection.png";
import mocktailsCollection from "@/assets/mocktails_collection.png";
import coffeTeaCollection from "@/assets/coffee_tea_collection.png";
import friesCollection from "@/assets/fries_collection.png";
import soupsCollection from "@/assets/soups_collection.png";
import guacamoleCustom from "@/assets/guacamole_custom.png";
import originalFalafelWrapCustom from "@/assets/original_falafel_wrap_custom.png";
import beyondKebabCustom from "@/assets/beyond_kebab_custom.png";
import desiFalafelPlateCustom from "@/assets/desi_falafel_plate_custom.png";

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



export const imageMap: Record<string, any> = {
  beetAvocadoToast, guacamoleBowl, loadedCheeseNachos, byoPitaWrap,
  tabboulehBowl, originalFalafelWrap, beyondKebab, desiFalafelPlate,
  beyondBurger, gyroCarnitasTacos, justEggScramble, menuShrimp,
  soupsCollection, friesCollection, dessertsCollection, menuLatte,
  coffeTeaCollection, menuMojito, menuCoconut, mocktailsCollection,
  menuDessert, guacamoleCustom, originalFalafelWrapCustom, beyondKebabCustom, desiFalafelPlateCustom,
  "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600",
  "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
  "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  "https://images.unsplash.com/photo-1620589125156-fd5028c5e05b?w=600": "https://images.unsplash.com/photo-1620589125156-fd5028c5e05b?w=600",
  "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
  "https://images.unsplash.com/photo-1626844131082-256783844137?w=600": "https://images.unsplash.com/photo-1626844131082-256783844137?w=600",
  "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
  "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600": "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600",
  "https://images.unsplash.com/photo-1545247181-516773cae754?w=600": "https://images.unsplash.com/photo-1545247181-516773cae754?w=600"
};

export const resolveImage = (img: string) => imageMap[img] || img;

const toId = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const Menu = () => {
  const { addToCart, cart, updateQuantity } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  const getCartItem = (itemId: string) => cart.find(c => String(c.id) === String(itemId));

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    Promise.all([
      fetch(`${apiUrl}/menu`),
      fetch(`${apiUrl}/categories`)
    ])
      .then(async ([menuRes, catRes]) => {
        if (!menuRes.ok) {
          console.error("Failed to load menu data: Server returned", menuRes.status);
          return;
        }
        if (!catRes.ok) {
          console.error("Failed to load categories: Server returned", catRes.status);
          return;
        }
        const menuData = await menuRes.json();
        const catData = await catRes.json();
        if (!Array.isArray(menuData)) {
          console.error("Failed to load menu data: Expected array, got", typeof menuData);
          return;
        }
        if (!Array.isArray(catData)) {
          console.error("Failed to load categories: Expected array, got", typeof catData);
          return;
        }
        const processedMenuData = applyCustomImages(menuData);
        setAllMenuItems(processedMenuData);

        const catNames = catData.filter((c: { name: string }) => c.name !== "All").map((c: { name: string }) => c.name);
        setCategories(catNames);
        if (catNames.length > 0) setActiveCategory(catNames[0]);
      })
      .catch((err) => console.error("Failed to load menu data", err));
  }, []);

  useEffect(() => {
    if (allMenuItems.length === 0) return;

    // Register scroll trigger with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // setTimeout to ensure DOM has updated with allMenuItems
    const timeout = setTimeout(() => {
      // Animate all menu cards beautifully
      const cards = document.querySelectorAll('.gsap-menu-card');

      cards.forEach((card, i) => {
        const trigger = ScrollTrigger.create({
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none reverse"
        });
        scrollTriggersRef.current.push(trigger);

        gsap.fromTo(card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: trigger
          }
        );
      });
    }, 100);

    // Cleanup scroll hints
    return () => {
      clearTimeout(timeout);
      scrollTriggersRef.current.forEach(t => t.kill());
      scrollTriggersRef.current = [];
    };
  }, [allMenuItems]);

  useEffect(() => {
    if (categories.length === 0) return;

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
  }, [categories]);

  useEffect(() => {
    return () => {
      Object.values(timeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  // Auto-scroll the category bar to keep the active item visible
  useEffect(() => {
    if (activeCategory) {
      const activeBtn = document.getElementById(`cat-btn-${toId(activeCategory)}`);
      const navContainer = document.getElementById('category-nav');

      if (activeBtn && navContainer) {
        const containerWidth = navContainer.offsetWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;

        // Center the active button in the scrollable container
        navContainer.scrollTo({
          left: btnLeft - (containerWidth / 2) + (btnWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeCategory]);

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
      <section className="bg-primary pt-24 pb-12 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10 hoverable">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold leading-tight mb-3"
            style={{ color: "hsl(40 20% 96%)", letterSpacing: "-0.02em" }}
          >
            Our <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Menu</span>
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
      <div className="sticky top-20 z-40 bg-[hsl(40_18%_96%)]/95 backdrop-blur-xl border-b border-primary/10 shadow-sm py-3 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-12">
          <div
            id="category-nav"
            className="flex overflow-x-auto gap-2 md:gap-4 hide-scrollbar justify-start md:justify-center items-center py-1"
          >
            {categories.map((category) => (
              <button
                key={category}
                id={`cat-btn-${toId(category)}`}
                onClick={() => scrollToCategory(category)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-[11px] md:text-[12px] uppercase tracking-[0.15em] font-bold transition-all duration-500 whitespace-nowrap hoverable ${activeCategory === category
                  ? "shadow-[0_4px_12px_rgba(228,168,32,0.25)] scale-105"
                  : "hover:bg-primary/5 hover:scale-105"
                  }`}
                style={
                  activeCategory === category
                    ? {
                      background: "hsl(43 74% 48%)",
                      color: "hsl(195 30% 8%)",
                      border: "1px solid hsl(43 74% 48%)",
                    }
                    : {
                      background: "transparent",
                      color: "hsl(195 30% 12% / 0.6)",
                      border: "1px solid hsl(38 12% 88% / 0.5)",
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
      <div className="container mx-auto px-6 md:px-12 pb-20">
        {categories.map((category) => {
          const categoryItems = allMenuItems.filter((item) => item.category === category);

          if (categoryItems.length === 0) return null;

          return (
            <div key={category} id={toId(category)} className="pt-10 pb-6 border-b border-primary/10 last:border-0 scroll-mt-32">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 text-center"
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
                      <div className="flex flex-col items-center bg-transparent group mb-6 cursor-pointer h-full hoverable">
                        <div className={`relative overflow-hidden aspect-square w-full max-w-[260px] mx-auto mb-4 transition-transform duration-500 group-hover:scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white border border-black/5 ${shapeClass}`}>
                          <img
                            src={resolveImage(item.image)}
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
                        </div>

                        <h3 className="text-xl md:text-2xl font-serif font-bold text-primary mb-3 text-center transition-colors group-hover:text-[hsl(43_74%_48%)] px-2">
                          {item.title} <span className="font-serif font-bold tracking-tight text-xl md:text-2xl ml-1 text-accent">{item.price?.replace('$', '৳').replace('.00', '')}</span>
                        </h3>
                        <p className="text-[13px] md:text-[14px] text-center text-primary/80 leading-relaxed px-4 md:px-8 mb-3 font-medium line-clamp-2">
                          {item.description}
                        </p>

                        <div className="mt-auto px-4 md:px-8 w-full flex flex-col gap-3 pb-2 z-10">
                          {(() => {
                            const cartItem = getCartItem(String(item.id));
                            if (cartItem) {
                              return (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center justify-between w-full bg-emerald-500 rounded-full overflow-hidden shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <button
                                    onClick={(e) => { e.preventDefault(); updateQuantity(Number(cartItem.id), cartItem.quantity - 1); }}
                                    className="w-10 h-10 flex items-center justify-center text-white font-bold text-xl hover:bg-white/20 transition-colors rounded-full"
                                  >
                                    −
                                  </button>
                                  <span className="text-white font-bold text-sm flex items-center gap-1.5">
                                    <Check size={13} strokeWidth={3} />
                                    {cartItem.quantity} in cart
                                  </span>
                                  <button
                                    onClick={(e) => { e.preventDefault(); updateQuantity(Number(cartItem.id), cartItem.quantity + 1); }}
                                    className="w-10 h-10 flex items-center justify-center text-white font-bold text-xl hover:bg-white/20 transition-colors rounded-full"
                                  >
                                    +
                                  </button>
                                </motion.div>
                              );
                            }
                            return (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  const numericPrice = parseFloat((item.price || '0').replace(/[^0-9.]/g, ''));
                                  addToCart({
                                    id: Number(item.id),
                                    title: item.title,
                                    price: isNaN(numericPrice) ? 0 : numericPrice,
                                    priceStr: item.price?.replace('$', '৳').replace('.00', ''),
                                    image: resolveImage(item.image),
                                  });
                                  setAddedItems(prev => ({ ...prev, [item.id]: true }));
                                  if (timeoutRef.current[item.id]) {
                                    clearTimeout(timeoutRef.current[item.id]);
                                  }
                                  timeoutRef.current[item.id] = setTimeout(() => { setAddedItems(prev => ({ ...prev, [item.id]: false })); }, 1500);
                                }}
                                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[11px] uppercase tracking-[0.1em] font-bold transition-all duration-300 z-20 ${addedItems[item.id]
                                  ? 'bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.4)] scale-95'
                                  : 'bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] shadow-[0_4px_14px_rgba(228,168,32,0.3)] hover:scale-105'
                                  }`}
                              >
                                <AnimatePresence mode="wait">
                                  {addedItems[item.id] ? (
                                    <motion.span key="added" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="flex items-center gap-1.5">
                                      <Check size={15} strokeWidth={3} /> Added!
                                    </motion.span>
                                  ) : (
                                    <motion.span key="add" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="flex items-center gap-1.5">
                                      <ShoppingCart size={15} /> Add to Cart
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </button>
                            );
                          })()}

                          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[hsl(43_74%_48%)] group-hover:text-primary transition-colors duration-300">
                            View Details
                            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </div>


                      </div>
                    </Link>
                  )
                })}
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
