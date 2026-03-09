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
                <div className="md:col-span-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-4 block"
                        style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                    ✦ The Story
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8"
                      style={{ letterSpacing: "-0.03em" }}>
                    About This <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Dish</span>
                  </h2>
                  <div className="text-muted-foreground leading-[1.8] text-[17px] whitespace-pre-line mb-16">
                    {item.longDescription}
                  </div>

                  <h3 className="text-3xl font-serif font-bold text-primary mb-6">
                    Overview
                  </h3>
                  <p className="text-muted-foreground leading-[1.8] text-[17px] mb-12">
                    {item.overview}
                  </p>
                </div>
                
                <div className="md:col-span-4 sticky top-32 flex flex-col gap-6 self-start">
                  {/* Single Unified Sidebar Box */}
                  <div className="bg-white p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-3xl border border-black/5">
                    
                    {/* Price Section */}
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-black/5">
                      <span className="text-[12px] uppercase tracking-[0.15em] font-bold text-muted-foreground pt-1">Price</span>
                      <span className="text-3xl font-serif font-bold" style={{ color: "hsl(43 74% 48%)" }}>
                        {item.price}
                      </span>
                    </div>

                    {/* Ingredients Section */}
                    <div className="mb-10 pb-8 border-b border-black/5">
                      <h3 className="text-[13px] uppercase tracking-[0.15em] font-bold text-primary mb-6">
                        Key Ingredients
                      </h3>
                      <ul className="space-y-4">
                        {item.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ background: "hsl(43 74% 48%)" }} />
                            <span className="text-slate-500 text-[15px] font-medium leading-snug">{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quantity Section */}
                    <div className="flex flex-col gap-4 mb-8">
                      <span className="text-[12px] uppercase tracking-[0.15em] font-bold text-primary">Quantity</span>
                      <div className="flex items-center gap-4 bg-[hsl(40_18%_96%)] rounded-xl p-1.5 border border-black/5 w-fit">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-black/5 active:scale-95 transition-all text-primary"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg text-primary w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-[hsl(43_74%_48%)] shadow-sm hover:brightness-110 active:scale-95 transition-all text-[hsl(195_30%_8%)]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
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
                      className="w-full bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(228,168,32,0.3)] hover:shadow-[0_8px_25px_rgba(228,168,32,0.4)] hover:-translate-y-1 transition-all text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
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
