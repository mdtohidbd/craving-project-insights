import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";

const stats = [
  { number: "500+", label: "Restaurants" },
  { number: "100+", label: "Fresh Ingredients" },
  { number: "5★", label: "Star Rating" },
  { number: "200+", label: "Happy Reviews" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] bg-primary overflow-hidden flex items-center pt-20 pb-10">
      {/* Atmospheric warm glows — no cold blues per SKILL.md HSB rule */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full" 
          style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} 
        />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full" 
          style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.03), transparent 70%)" }} 
        />
        {/* Subtle grid — geometric pattern for depth per SKILL.md */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(40 20% 96% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(40 20% 96% / 0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-block text-[9px] uppercase tracking-[0.25em] text-primary-foreground/40 font-medium mb-3"
            >
              ✦ Fine Dining Experience
            </motion.span>

            <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-serif font-bold text-primary-foreground leading-[0.92] mb-3"
                style={{ letterSpacing: "-0.04em" }}>
              Savor
              <br />
              Every
              <br />
              <span className="italic" style={{ color: "hsl(43 74% 58%)" }}>Moment</span>
            </h1>

            <p className="text-primary-foreground/75 text-sm md:text-base max-w-sm mb-5 leading-[1.6]">
              Unlock an explosion of flavors in every bite. Our handpicked
              selections of bold and delicious food.
            </p>

            <div className="flex items-center gap-6">
              <Link to="/menu" className="bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold px-7 py-3 rounded-full text-[11px] uppercase tracking-wider shadow-[0_8px_20px_rgba(228,168,32,0.2)] hover:-translate-y-1 transition-all inline-flex items-center gap-2 group">
                Order Now
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
              </Link>
              <Link
                to="/menu"
                className="text-primary-foreground/40 text-[11px] font-bold uppercase tracking-widest hover:text-primary-foreground/70 transition-colors duration-500 flex items-center gap-2 group underline underline-offset-8 decoration-white/10 hover:decoration-white/30"
              >
                View Menu
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative hidden lg:block"
          >
            {/* Floating Review Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -top-4 -right-4 z-20 rounded-2xl p-4 max-w-[160px]"
              style={{
                background: "hsl(195 30% 14% / 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid hsl(40 20% 96% / 0.08)",
              }}
            >
              <div className="flex gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "hsl(43 74% 58%)" }} className="text-[10px]">★</span>
                ))}
              </div>
              <p className="text-primary-foreground/50 text-[10px] leading-relaxed mb-2">
                "An extraordinary culinary journey. Each dish is a masterpiece."
              </p>
              <div className="text-[7px] uppercase tracking-[0.2em] font-bold" style={{ color: "hsl(43 74% 58% / 0.7)" }}>
                — Food Critic
              </div>
            </motion.div>

            {/* Main Image Container */}
            <div className="relative w-full max-w-[420px] ml-auto">
              <div className="aspect-[4/4.5] overflow-hidden shadow-2xl" style={{ borderRadius: "1.5rem" }}>
                <img
                  src={heroFood}
                  alt="Signature BBQ dish"
                  className="w-full h-full object-cover transition-transform [transition-duration:2s] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-10 rounded-full"
                   style={{ background: "hsl(43 60% 50% / 0.1)", filter: "blur(30px)" }} />
            </div>
          </motion.div>
        </div>

        {/* Stats Row - Compact version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-between gap-6 mt-6 pt-4 border-t"
          style={{ borderColor: "hsl(40 20% 96% / 0.04)" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex flex-col items-center md:items-start"
            >
              <div className="text-2xl md:text-3xl font-serif font-bold italic"
                   style={{ color: "hsl(43 74% 58%)", letterSpacing: "-0.03em" }}>
                {stat.number}
              </div>
              <div className="text-primary-foreground/20 text-[8px] uppercase tracking-[0.2em] mt-1 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
