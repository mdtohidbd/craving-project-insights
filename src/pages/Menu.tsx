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
import { generateSlug } from "@/utils/slugUtils";

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

const Menu = () => {
  const { addToCart, cart, updateQuantity } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  const getCartItem = (itemId: string) => cart.find(c => String(c.id) === String(itemId));

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    Promise.all([
      fetch(`${apiUrl}/menu`),
      fetch(`${apiUrl}/categories`),
      new Promise(resolve => setTimeout(resolve, 800)) // artificial delay to show skeletons
    ])
      .then(async ([menuRes, catRes]) => {
        if (!menuRes.ok) {
          console.error("Failed to load menu data: Server returned", menuRes.status);
          return;
        }
        
        const menuData = await menuRes.json();
        const processedMenuData = applyCustomImages(menuData);
        setAllMenuItems(processedMenuData);

        let catData = [];
        if (catRes.ok) {
           try { catData = await catRes.json(); } catch(e) {}
        }
        
        const apiCatNames = catData.filter((c: any) => c.name !== "All").map((c: any) => c.name);
        const itemCatNames = Array.from(new Set(processedMenuData.map((m: any) => m.category))).filter(Boolean);
        
        // Merge and unique
        const allCatNames = Array.from(new Set([...apiCatNames, ...itemCatNames]));
        
        // Only keep categories that actually have items
        const validCatNames = allCatNames.filter(cat => 
          processedMenuData.some(item => item.category === cat)
        );
        
        setCategories(validCatNames as string[]);
        if (validCatNames.length > 0) setActiveCategory(validCatNames[0] as string);
      })
      .catch((err) => console.error("Failed to load menu data", err))
      .finally(() => setIsLoading(false));
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
    }, 100);

    // Cleanup scroll hints
    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [allMenuItems]);

  useEffect(() => {
    if (categories.length === 0) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          let currentCategory = activeCategory;
          const scrollPos = window.scrollY + 250;
          
          for (const cat of categories) {
            const id = generateSlug(cat);
            const element = document.getElementById(id);
            if (element) {
              const rect = element.getBoundingClientRect();
              const absoluteTop = rect.top + window.scrollY;
              if (absoluteTop <= scrollPos) {
                currentCategory = cat;
              }
            }
          }
          if (currentCategory !== activeCategory) {
            setActiveCategory(currentCategory);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // passive: true improves scrolling performance significantly
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  // Auto-scroll the category bar to keep the active item visible
  useEffect(() => {
    if (activeCategory) {
      const activeBtn = document.getElementById(`cat-btn-${generateSlug(activeCategory)}`);
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
    const element = document.getElementById(generateSlug(category));
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
                id={`cat-btn-${generateSlug(category)}`}
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
            <div key={category} id={generateSlug(category)} className="pt-10 pb-6 border-b border-primary/10 last:border-0 scroll-mt-32">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 text-center"
              >
                {category}
              </motion.h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => {
                    const shapeClass = getShapeClass(index);
                    return (
                      <div key={`skeleton-${index}`} className="flex flex-col items-center bg-transparent mb-6 h-full animate-pulse p-4">
                        <div className={`relative overflow-hidden aspect-square w-full max-w-[240px] mx-auto mb-6 bg-zinc-200 border border-black/5 p-1 ${shapeClass}`}>
                          <div className={`w-full h-full overflow-hidden ${shapeClass} bg-zinc-300`}></div>
                        </div>
                        <div className="text-center flex-grow flex flex-col mb-4 items-center w-full">
                          <div className="w-2/3 h-5 bg-zinc-200 mb-3 rounded"></div>
                          <div className="w-full h-3 bg-zinc-200 mb-2 rounded"></div>
                          <div className="w-5/6 h-3 bg-zinc-200 mb-4 rounded"></div>
                        </div>
                        <div className="w-full px-6 pb-2">
                          <div className="w-full h-10 rounded-full bg-zinc-200"></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  categoryItems.map((item, index) => {
                    const shapeClass = getShapeClass(index);

                    return (
                      <Link
                        key={item.id}
                        to={`/menu/${generateSlug(item.title)}`}
                        className="group gsap-menu-card opacity-0 block h-full"
                      >
                        <div className="flex flex-col items-center h-full hoverable mb-6">

                          <div className={`relative overflow-hidden aspect-square w-full max-w-[240px] mx-auto mb-6 transition-transform duration-500 group-hover:scale-[1.03] shadow-[0_4px_20px_rgba(0,0,0,0.04)] bg-white border border-black/5 p-1.5 ${shapeClass}`}>
                            <div className={`w-full h-full overflow-hidden ${shapeClass}`}>
                              <img
                                src={resolveImage(item.image)}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.05]"
                              />
                            </div>
                          </div>

                          <div className="text-center flex-grow flex flex-col mb-4">
                            <h3 className="text-xl md:text-[22px] font-serif font-bold text-primary mb-2.5 transition-colors group-hover:text-accent" style={{ letterSpacing: "-0.01em" }}>
                              {item.title}
                            </h3>
                            <p className="text-[13px] text-muted-foreground leading-[1.6] px-2 md:px-4 line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          <div className="w-full px-4 md:px-6 pb-2 relative z-20">
                            {(() => {
                              const cartItem = getCartItem(String(item.id));
                              if (cartItem) {
                                return (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-between w-full bg-emerald-500 text-white rounded-full overflow-hidden shadow-sm border border-emerald-600/50"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <button
                                      onClick={(e) => { e.preventDefault(); updateQuantity(Number(cartItem.id), cartItem.quantity - 1); }}
                                      className="w-10 h-10 flex flex-1 items-center justify-center font-bold hover:bg-black/10 transition-colors"
                                    >
                                      −
                                    </button>
                                    <span className="font-bold text-xs flex items-center gap-1.5">
                                      {cartItem.quantity} <Check size={12} strokeWidth={4} />
                                    </span>
                                    <button
                                      onClick={(e) => { e.preventDefault(); updateQuantity(Number(cartItem.id), cartItem.quantity + 1); }}
                                      className="w-10 h-10 flex flex-1 items-center justify-center font-bold hover:bg-black/10 transition-colors"
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
                                    setTimeout(() => { setAddedItems(prev => ({ ...prev, [item.id]: false })); }, 1500);
                                  }}
                                  className={`flex items-center justify-between w-full py-2.5 px-5 rounded-full text-[11px] uppercase tracking-[0.1em] font-bold transition-all duration-300 border ${addedItems[item.id]
                                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-95'
                                      : 'bg-transparent text-primary/80 border-primary/10 hover:border-accent hover:bg-accent hover:text-[hsl(195_30%_8%)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_14px_rgba(228,168,32,0.2)]'
                                    }`}
                                >
                                  <AnimatePresence mode="wait">
                                    {addedItems[item.id] ? (
                                      <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 mx-auto">
                                        Added <Check size={14} strokeWidth={3} />
                                      </motion.span>
                                    ) : (
                                      <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between w-full">
                                        <span className="text-[12px]">{item.price?.replace('$', '৳').replace('.00', '')}</span>
                                        <div className="flex items-center gap-2 border-l pl-3 border-current/20">
                                          <span>Add</span>
                                          <ShoppingCart size={13} className="opacity-70 group-hover:opacity-100" />
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </Link>
                    );
                  }))}
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
