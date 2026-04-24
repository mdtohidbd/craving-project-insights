import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { resolveImage } from "@/pages/Menu";
import { MenuItem } from "@/types";
import { applyCustomImages } from "@/utils/menuUtils";

const MenuSection = () => {
  const { addToCart, cart, updateQuantity } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const getCartItem = (itemId: string) => cart.find(c => String(c.id) === String(itemId));

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/menu`);
        if (!res.ok) {
          console.error("Failed to load menu data: Server returned", res.status);
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Failed to load menu data: Expected array, got", typeof data);
          return;
        }
        const processedData = applyCustomImages(data);
        // Limit to 6 items for the home page section
        setMenuItems(processedData.slice(0, 6));
      } catch (err) {
        console.error("Failed to load menu data", err);
      }
    };
    fetchMenu();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
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
    timeoutRef.current[item.id] = setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  useEffect(() => {
    return () => {
      Object.values(timeoutRef.current).forEach(clearTimeout);
    };
  }, []);

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
          className="text-center mb-4"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-3 block"
            style={{ color: "hsl(43 74% 48% / 0.8)" }}>
            ✦ Our Signature Collection
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary mb-3 leading-[1.1]"
            style={{ letterSpacing: "-0.04em" }}>
            Curated <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Flavors</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-[1.6]">
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
                      src={resolveImage(item.image)}
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
                      <span className="font-serif font-bold text-2xl md:text-3xl italic text-accent">
                        {item.price?.replace('$', '৳').replace('.00', '')}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[15px] leading-[1.7] opacity-90 mb-6">
                      {item.description}
                    </p>
                    <div className="mt-auto">
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
                                +
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
                            onClick={(e) => handleAddToCart(e, item)}
                            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[12px] uppercase tracking-[0.1em] font-bold transition-all duration-300 z-20 ${addedItems[item.id]
                              ? 'bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.4)] scale-95'
                              : 'bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] shadow-[0_4px_14px_rgba(228,168,32,0.3)] hover:scale-105 hover:bg-[hsl(43_74%_48%)]/90'
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
          className="text-center mt-8"
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
