import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import menuMojito from "@/assets/menu-mojito.jpg";
import menuCoconut from "@/assets/menu-coconut.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import menuDessert from "@/assets/menu-dessert.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import heroFood from "@/assets/hero-food.jpg";

const allMenuItems = [
  {
    id: "1",
    title: "BBQ Grilled Ribs",
    price: "$18.99",
    image: heroFood,
    category: "Grill",
    description: "Ribs glazed with savory-sweet barbecue sauce, caramelized to perfection on the grill.",
    longDescription: `Indulge in our signature BBQ Grilled Ribs — a masterpiece of smoky, sweet, and savory flavors. Each rack is slow-cooked to tenderness, then finished on the grill with our house-made barbecue glaze that caramelizes into a sticky, irresistible coating.

The result is meat that falls off the bone, bursting with layers of deep, complex flavor. Paired with our seasonal sides, this dish is the crown jewel of our grill menu.`,
    overview: "Slow-smoked pork ribs finished with house-made caramelized glaze.",
    ingredients: ["Premium pork ribs", "House BBQ glaze", "Smoked paprika", "Brown sugar rub", "Apple cider reduction"],
  },
  {
    id: "2",
    title: "Classic Mojito",
    price: "$4.75",
    image: menuMojito,
    category: "Cocktail",
    description: "Fresh mint and white rum blended into a refreshing cocktail.",
    longDescription: "A classic Cuban cocktail that's perfect for any occasion. Our version uses hand-muddled mint and freshly squeezed limes.",
    overview: "Fresh mint, lime juice, white rum, sugar, and soda water.",
    ingredients: ["Fresh mint leaves", "White rum", "Lime juice", "Demerara sugar", "Sparkling water"],
  },
  {
    id: "3",
    title: "Coconut Fizz",
    price: "$4.25",
    image: menuCoconut,
    category: "Beverage",
    description: "Sweet tropical vibes with creamy coconut and sparkling fizz.",
    longDescription: "Escape to paradise with our refreshing coconut fizz — tropical, light, and impossibly refreshing.",
    overview: "Coconut cream, pineapple juice, and sparkling water.",
    ingredients: ["Coconut cream", "Pineapple juice", "Sparkling water", "Orange garnish"],
  },
  {
    id: "4",
    title: "Garlic Butter Shrimp",
    price: "$14.99",
    image: menuShrimp,
    category: "Seafood",
    description: "Succulent shrimp seared in savory garlic butter sauce.",
    longDescription: "Our signature shrimp dish — seared to golden perfection in garlic-infused butter.",
    overview: "Fresh shrimp seared to perfection in garlic butter.",
    ingredients: ["Fresh shrimp", "Garlic", "Butter", "Parsley", "Lemon"],
  },
  {
    id: "5",
    title: "Golden Bliss",
    price: "$10.00",
    image: menuDessert,
    category: "Dessert",
    description: "A decadent golden creation balancing flavors and textures.",
    longDescription: "Our signature dessert — silky caramel flan adorned with edible gold leaf.",
    overview: "Caramel flan with gold leaf decoration and vanilla bean.",
    ingredients: ["Organic eggs", "Heavy cream", "Caramel", "Madagascar vanilla", "Gold leaf"],
  },
  {
    id: "6",
    title: "Iced Mocha Latte",
    price: "$5.00",
    image: menuLatte,
    category: "Coffee",
    description: "Rich espresso with chocolate syrup and cold milk.",
    longDescription: "The perfect pick-me-up — bold espresso meets smooth chocolate, served over ice.",
    overview: "Rich espresso with chocolate and cold milk.",
    ingredients: ["Double espresso", "Dark chocolate syrup", "Cold milk", "Whipped cream"],
  },
];

const MenuDetail = () => {
  const { id } = useParams();
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
                className="w-full h-[500px] md:h-[650px] object-cover transition-transform duration-[2s] hover:scale-105"
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
                
                <div className="md:col-span-4 self-start bg-card p-10 shadow-xl" style={{ borderRadius: "2rem", border: "1px solid hsl(38 12% 88%)" }}>
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/50">
                    <span className="text-[14px] uppercase tracking-[0.1em] font-medium text-muted-foreground">Price</span>
                    <span className="text-4xl font-serif font-bold italic" style={{ color: "hsl(43 74% 48%)" }}>
                      {item.price}
                    </span>
                  </div>
                  
                  <h3 className="text-[14px] uppercase tracking-[0.1em] font-bold text-primary mb-6">
                    Key Ingredients
                  </h3>
                  <ul className="space-y-4 mb-10">
                    {item.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ background: "hsl(43 74% 48%)" }} />
                        <span className="text-muted-foreground text-[16px] leading-[1.5]">{ing}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="btn-gold w-full inline-flex items-center justify-center gap-3 group px-8 py-5">
                    Order Now
                    <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
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
            {relatedItems.map((relItem, index) => (
              <motion.div
                key={relItem.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/menu/${relItem.id}`} className="block h-full">
                  <div className="menu-card h-full">
                    <div className="relative overflow-hidden aspect-[4/3]" style={{ borderRadius: "1.5rem" }}>
                      <img
                        src={relItem.image}
                        alt={relItem.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-5 left-5 z-10">
                        <span className="category-tag shadow-sm backdrop-blur-md">
                          {relItem.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-7">
                      <div className="flex items-start justify-between gap-5">
                        <h3 className="text-2xl font-serif font-bold text-card-foreground group-hover:text-accent transition-colors duration-300">
                          {relItem.title}
                        </h3>
                        <span className="font-serif font-bold text-xl italic" style={{ color: "hsl(43 74% 48%)" }}>
                          {relItem.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MenuDetail;
