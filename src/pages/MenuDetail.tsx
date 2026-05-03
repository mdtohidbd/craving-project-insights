import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ShoppingCart, Minus, Plus, Check, Sparkles, Maximize2, ChevronLeft, ChevronRight, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { MenuItem } from "@/types";
import { applyCustomImages } from "@/utils/menuUtils";
import { resolveImage } from "./Menu";
import { generateSlug } from "@/utils/slugUtils";

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

const MenuDetail = () => {
  const { slug } = useParams();
  const { addToCart, cart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<{name: string, price: number}[]>([]);
  const [addedRelated, setAddedRelated] = useState<Record<string, boolean>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const getCartItem = (itemId: string) => cart.find(c => String(c.id) === String(itemId));

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${apiUrl}/menu`)
      .then(res => {
        if (!res.ok) {
          console.error("Failed to load menu data: Server returned", res.status);
          setLoading(false);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (!data || !Array.isArray(data)) {
          console.error("Failed to load menu data: Expected array");
          setLoading(false);
          return;
        }
        const processedData = applyCustomImages(data);
        const found = processedData.find((m: MenuItem) => m.title && generateSlug(m.title) === slug);
        setItem(found || null);
        
        if (found) {
            const getComplementaryCategories = (category?: string) => {
                if (!category) return [];
                const lowerCat = category.toLowerCase();
                if (lowerCat.includes('burger') || lowerCat.includes('pizza') || lowerCat.includes('main')) return ['drinks', 'beverage', 'dessert', 'sides'];
                if (lowerCat.includes('drink') || lowerCat.includes('beverage')) return ['appetizer', 'dessert', 'burger', 'pizza', 'main'];
                if (lowerCat.includes('dessert')) return ['drinks', 'beverage', 'coffee'];
                return [];
            };
            const compCategories = getComplementaryCategories(found.category);
            const scoredItems = processedData
                .filter((item: MenuItem) => item.id !== found.id)
                .map((item: MenuItem) => {
                    let score = 0;
                    const lowerItemCat = item.category ? item.category.toLowerCase() : '';
                    if (compCategories.some(c => lowerItemCat.includes(c))) score += 10;
                    else if (item.category !== found.category) score += 5;
                    score += Math.random() * 2;
                    return { item, score };
                })
                .sort((a: any, b: any) => b.score - a.score);
            
            setRelatedItems(scoredItems.slice(0, 3).map((s: any) => s.item));
        } else {
            setRelatedItems([]);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    return () => {
      Object.values(timeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-primary font-serif font-medium">Preparing your table...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <Navbar />
        <div className="pt-40 pb-20 text-center relative z-10 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-primary mb-6" style={{ letterSpacing: "-0.04em" }}>
            Dish Not Found
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">We couldn't find the culinary creation you're looking for.</p>
          <Link to="/menu" className="btn-solid inline-flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" /> Return to Menu
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar theme="light" />

      <main className="flex-grow pt-24 pb-20 relative">
        {/* Floating Background Blooms */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full opacity-10 pointer-events-none blur-3xl transform translate-x-1/3 -translate-y-1/3 mix-blend-multiply" style={{ background: "radial-gradient(circle, hsl(43 74% 48%), transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full opacity-5 pointer-events-none blur-3xl transform -translate-x-1/4 translate-y-1/4 mix-blend-multiply" style={{ background: "radial-gradient(circle, hsl(195 30% 8%), transparent 70%)" }}></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">

          <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 md:mb-12 group select-none">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Menu
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Image Column - Redesigned to be smaller and more elegant */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg mx-auto lg:mx-0 lg:sticky lg:top-32"
            >
              <div className="space-y-6">
                {/* Main Image View */}
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl bg-white border border-black/5 p-2 md:p-3 group">
                  <div 
                    className="w-full h-full rounded-[1.5rem] overflow-hidden relative cursor-zoom-in"
                    onClick={() => setIsFullScreen(true)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        src={resolveImage(item.images && item.images.length > 0 ? item.images[activeImageIndex] : item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                    
                    {/* Expand Icon */}
                    <div className="absolute top-6 right-6 p-3 rounded-full bg-white/90 backdrop-blur shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Maximize2 className="w-5 h-5 text-primary" />
                    </div>

                    {/* Navigation Arrows for multiple images */}
                    {item.images && item.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev === 0 ? item.images!.length - 1 : prev - 1));
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-primary pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev === item.images!.length - 1 ? 0 : prev + 1));
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-primary pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Decorative Elements */}
                  <DiamondStar className="absolute top-0 left-8 w-4 h-4 text-accent -translate-y-1/2 drop-shadow-sm bg-white" />
                  <DiamondStar className="absolute bottom-12 right-0 w-5 h-5 text-primary translate-x-1/2 drop-shadow-sm bg-white" />
                </div>

                {/* Thumbnails */}
                {item.images && item.images.length > 1 && (
                  <div className="flex gap-3 justify-center">
                    {item.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === idx ? "border-accent scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={resolveImage(img)} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Content Column - UX focused layout */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col h-full justify-center lg:py-10"
            >
              <div className="mb-8">
                <span className="inline-block text-[11px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 rounded-full mb-4 border border-accent text-accent bg-accent/5">
                  {item.category}
                </span>

                <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 leading-[0.95]" style={{ letterSpacing: "-0.03em" }}>
                  {item.title}
                </h1>

                <div className="text-3xl md:text-4xl font-serif text-accent flex items-end gap-2 mb-8">
                  {item.price?.replace('$', '৳').replace('.00', '')}
                </div>

                <div className="h-px w-16 bg-primary/10 mb-8"></div>

                <p className="text-muted-foreground leading-[1.8] text-[16px] md:text-[17px] font-medium mb-12 max-w-xl">
                  {item.description}
                </p>

                {item.addOns && item.addOns.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-serif font-bold text-primary mb-4">Add-ons</h3>
                    <div className="space-y-3 max-w-xl">
                      {item.addOns.map((addon, index) => {
                        const isSelected = selectedAddOns.some(a => a.name === addon.name);
                        return (
                          <label key={index} className="flex items-center justify-between p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-accent"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAddOns([...selectedAddOns, addon]);
                                  } else {
                                    setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
                                  }
                                }}
                              />
                              <span className="font-medium text-neutral-800">{addon.name}</span>
                            </div>
                            <span className="text-accent font-medium">
                              {addon.price === 0 || Number(addon.price) === 0 ? 'Free' : `+৳${addon.price}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Cart Actions Block */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-primary/5 max-w-xl">

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 bg-[hsl(40_18%_96%)] p-2 rounded-xl border border-black/5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-black/5 active:scale-95 transition-all text-primary"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-xl text-primary w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent shadow-sm hover:brightness-105 active:scale-95 transition-all text-[hsl(195_30%_8%)]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => {
                      const numericPrice = parseFloat((item.price || '0').replace(/[^0-9.]/g, ''));
                      const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
                      const finalPrice = (isNaN(numericPrice) ? 0 : numericPrice) + addOnsTotal;
                      
                      const addOnsString = selectedAddOns.map(a => a.name).sort().join('-');
                      const cartItemId = addOnsString ? `${item.id}-${addOnsString}` : item.id;

                      addToCart({
                        id: cartItemId,
                        title: item.title,
                        price: finalPrice,
                        priceStr: `৳${finalPrice}`,
                        image: resolveImage(item.image),
                        quantity: quantity,
                        addOns: selectedAddOns,
                        availableAddOns: item.addOns
                      });
                      setQuantity(1);
                      setSelectedAddOns([]);
                    }}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 group"
                  >
                    <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Inline Recommended Cross-Sell Component */}
              {relatedItems.length > 0 && (
                <div className="mt-8 max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                     <Sparkles className="w-4 h-4 text-accent" />
                     <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Frequently Bought Together</h4>
                  </div>
                  <div className="space-y-3">
                    {relatedItems.slice(0, 2).map((recItem) => {
                      const recCartItem = getCartItem(String(recItem.id));
                      return (
                        <div key={recItem.id} className="flex items-center justify-between p-3 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/10 transition-all group">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = `/menu/${generateSlug(recItem.title)}`}>
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                              <img src={resolveImage(recItem.image)} alt={recItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-neutral-800 leading-tight group-hover:text-primary transition-colors">{recItem.title}</span>
                              <span className="text-xs font-medium text-accent mt-0.5">{recItem.price?.replace('$', '৳').replace('.00', '')}</span>
                            </div>
                          </div>
                          
                          <div className="shrink-0">
                            {recCartItem ? (
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 text-xs font-bold">
                                  <Check className="w-3.5 h-3.5" /> Added ({recCartItem.quantity})
                                </div>
                            ) : (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const numericPrice = parseFloat((recItem.price || '0').replace(/[^0-9.]/g, ''));
                                    addToCart({
                                      id: Number(recItem.id),
                                      title: recItem.title,
                                      price: isNaN(numericPrice) ? 0 : numericPrice,
                                      priceStr: recItem.price?.replace('$', '৳').replace('.00', ''),
                                      image: resolveImage(recItem.image),
                                      quantity: 1,
                                      availableAddOns: recItem.addOns
                                    });
                                  }}
                                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(40_18%_96%)] text-primary hover:bg-accent hover:text-[hsl(195_30%_8%)] transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>

          </div>
        </div>
      </main>

      {/* Related Items Section - Matching the clean architectural grid */}
      <section className="bg-[hsl(40_18%_96%)] border-t border-primary/10 py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">

          <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="text-center md:text-left">
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium block text-accent mb-3">
                ✦ Perfect Pairings
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary" style={{ letterSpacing: "-0.03em" }}>
                You Might Also <span className="italic text-accent">Like</span>
              </h2>
            </div>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] font-medium text-primary hover:text-accent transition-colors duration-300 group"
            >
              View Menu
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedItems.map((item, index) => {
              const shapeClass = getShapeClass(index);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group h-full"
                >
                  <Link to={`/menu/${generateSlug(item.title)}`} className="block h-full">
                    <div className="flex flex-col items-center h-full hoverable">

                      <div className={`relative overflow-hidden aspect-square w-full max-w-[240px] mx-auto mb-6 transition-transform duration-500 group-hover:scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-white border border-black/5 p-1 ${shapeClass}`}>
                        <div className={`w-full h-full overflow-hidden ${shapeClass}`}>
                          <img
                            src={resolveImage(item.image)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="text-center flex-grow flex flex-col mb-4">
                        <h3 className="text-xl font-serif font-bold text-primary mb-2 transition-colors group-hover:text-accent">
                          {item.title}
                        </h3>
                        <p className="text-[13px] text-muted-foreground leading-relaxed px-4 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="w-full px-6 pb-2">
                        {(() => {
                          const cartItem = getCartItem(String(item.id));
                          if (cartItem) {
                            return (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-between w-full bg-emerald-500 text-white rounded-full overflow-hidden shadow-md"
                                onClick={(e) => e.preventDefault()}
                              >
                                <button
                                  onClick={(e) => { e.preventDefault(); updateQuantity(Number(cartItem.id), cartItem.quantity - 1); }}
                                  className="w-10 h-10 flex flex-1 items-center justify-center font-bold hover:bg-black/10 transition-colors"
                                >
                                  −
                                </button>
                                <span className="font-bold text-xs flex items-center gap-1">
                                  <Check size={12} strokeWidth={3} /> {cartItem.quantity}
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
                                setAddedRelated(prev => ({ ...prev, [item.id]: true }));
                                if (timeoutRef.current[item.id]) clearTimeout(timeoutRef.current[item.id]);
                                timeoutRef.current[item.id] = setTimeout(() => { setAddedRelated(prev => ({ ...prev, [item.id]: false })); }, 1500);
                              }}
                              className={`flex items-center justify-between w-full py-2.5 px-4 rounded-full text-[11px] uppercase tracking-[0.1em] font-bold transition-all duration-300 border ${addedRelated[item.id]
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-95'
                                : 'bg-transparent text-primary border-primary/20 hover:border-accent hover:bg-accent hover:text-primary-foreground group-hover:border-accent'
                                }`}
                            >
                              <AnimatePresence mode="wait">
                                {addedRelated[item.id] ? (
                                  <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 mx-auto">
                                    <Check size={14} strokeWidth={3} /> Added
                                  </motion.span>
                                ) : (
                                  <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between w-full">
                                    <span>{item.price?.replace('$', '৳').replace('.00', '')}</span>
                                    <div className="flex items-center gap-2">
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
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />

      {/* Full Screen Image Viewer Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-12"
          >
            <button 
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  src={resolveImage(item.images && item.images.length > 0 ? item.images[activeImageIndex] : item.image)}
                  alt={item.title}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />
              </AnimatePresence>

              {/* Navigation Arrows for Full Screen */}
              {item.images && item.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? item.images!.length - 1 : prev - 1))}
                    className="absolute left-4 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === item.images!.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip in Full Screen */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-4 mt-8">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? "border-accent scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                    }`}
                  >
                    <img src={resolveImage(img)} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuDetail;
