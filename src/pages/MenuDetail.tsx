import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ShoppingCart, Minus, Plus, Check } from "lucide-react";
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
import { resolveImage } from "./Menu";

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
  const { id } = useParams();
  const { addToCart, cart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<any>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedRelated, setAddedRelated] = useState<Record<string, boolean>>({});

  const getCartItem = (itemId: string) => cart.find(c => String(c.id) === String(itemId));

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${apiUrl}/menu`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((m: any) => m.id.toString() === id);
        setItem(found);
        setRelatedItems(data.filter((m: any) => m.id.toString() !== id).slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-white text-xl font-serif">Loading...</div>
      </div>
    );
  }

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



  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-20 pb-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[0%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3"
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
            className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-primary-foreground leading-[0.9] mb-3"
            style={{ letterSpacing: "-0.04em" }}
          >
            {item.title}
          </motion.h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="-mt-16 pb-24 relative z-20">
        <div className="container mx-auto px-6 md:px-12">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto mb-12"
          >
            <div className="relative overflow-hidden shadow-2xl" style={{ borderRadius: "3rem" }}>
              <img
                src={resolveImage(item.image)}
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
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4"
                    style={{ letterSpacing: "-0.02em" }}>
                    About This <span className="italic font-medium" style={{ color: "hsl(43 74% 48%)" }}>Dish</span>
                  </h2>
                  <div className="text-[#64748b] leading-[1.8] text-[15px] md:text-[16px] font-medium whitespace-pre-line">
                    {item.description}
                  </div>
                </div>

                <div className="md:col-span-4 sticky top-32 flex flex-col gap-6 self-start">
                  {/* Single Unified Sidebar Box */}
                  <div className="bg-white p-5 md:p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] rounded-2xl border border-black/5">

                    {/* Price Section */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Price</span>
                      <span className="text-3xl font-serif font-bold text-accent">
                        {item.price?.replace('$', '৳').replace('.00', '')}
                      </span>
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
                            priceStr: item.price?.replace('$', '৳').replace('.00', ''),
                            image: resolveImage(item.image),
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
          <div className="flex items-end justify-between mb-8">
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
                      <p className="text-[13px] md:text-[14px] text-center text-primary/80 leading-relaxed px-4 md:px-8 mb-4 font-medium line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-auto px-4 md:px-8 w-full flex flex-col gap-3 pb-2 z-10">
                        {(() => {
                          const cartItem = getCartItem(item.id);
                          if (cartItem) {
                            return (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-between w-full bg-emerald-500 rounded-full overflow-hidden shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                                onClick={(e) => e.preventDefault()}
                              >
                                <button
                                  onClick={(e) => { e.preventDefault(); updateQuantity(cartItem.id, cartItem.quantity - 1); }}
                                  className="w-10 h-10 flex items-center justify-center text-white font-bold text-xl hover:bg-white/20 transition-colors rounded-full"
                                >
                                  −
                                </button>
                                <span className="text-white font-bold text-sm flex items-center gap-1.5">
                                  <Check size={13} strokeWidth={3} />
                                  {cartItem.quantity} in cart
                                </span>
                                <button
                                  onClick={(e) => { e.preventDefault(); updateQuantity(cartItem.id, cartItem.quantity + 1); }}
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
                                const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                                addToCart({
                                  id: Number(item.id),
                                  title: item.title,
                                  price: isNaN(numericPrice) ? 0 : numericPrice,
                                  priceStr: item.price?.replace('$', '৳').replace('.00', ''),
                                  image: resolveImage(item.image),
                                });
                                setAddedRelated(prev => ({ ...prev, [item.id]: true }));
                                setTimeout(() => { setAddedRelated(prev => ({ ...prev, [item.id]: false })); }, 1500);
                              }}
                              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[11px] uppercase tracking-[0.1em] font-bold transition-all duration-300 z-20 ${
                                addedRelated[item.id]
                                  ? 'bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.4)] scale-95'
                                  : 'bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] shadow-[0_4px_14px_rgba(228,168,32,0.3)] hover:scale-105 hover:bg-[hsl(43_74%_48%)]/90'
                              }`}
                            >
                              <AnimatePresence mode="wait">
                                {addedRelated[item.id] ? (
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
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MenuDetail;
