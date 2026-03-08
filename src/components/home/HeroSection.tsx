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
    <section className="relative min-h-screen bg-primary overflow-hidden flex items-center">
      {/* Atmospheric warm glows — no cold blues per SKILL.md HSB rule */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full" 
          style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} 
        />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full" 
          style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.03), transparent 70%)" }} 
        />
        {/* Subtle grid — geometric pattern for depth per SKILL.md */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(40 20% 96% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(40 20% 96% / 0.08) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-block text-[11px] uppercase tracking-[0.3em] text-primary-foreground/40 font-medium mb-8"
            >
              ✦ Fine Dining Experience
            </motion.span>

            {/* SKILL.md: 70px+ needs -2% to -4% tracking */}
            <h1 className="text-[clamp(3.5rem,8vw,7rem)] font-serif font-bold text-primary-foreground leading-[0.88] mb-10"
                style={{ letterSpacing: "-0.04em" }}>
              Savor
              <br />
              Every
              <br />
              <span className="italic" style={{ color: "hsl(43 74% 58%)" }}>Moment</span>
            </h1>

            <p className="text-primary-foreground/35 text-lg max-w-md mb-12 leading-[1.7]">
              Unlock an explosion of flavors in every bite. Our handpicked
              selections of bold and delicious food will leave you craving more.
            </p>

            <div className="flex items-center gap-8">
              <Link to="/contact" className="btn-gold inline-flex items-center gap-3 group">
                Book a Table
                <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5" />
              </Link>
              <Link
                to="/menu"
                className="text-primary-foreground/40 text-[13px] font-medium hover:text-primary-foreground/70 transition-colors duration-500 flex items-center gap-2.5 group"
              >
                View Menu
                <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="relative"
          >
            {/* Floating Review Card — glass-card per SKILL.md depth layers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="absolute top-6 right-2 md:-right-2 z-20 rounded-2xl p-5 max-w-[200px]"
              style={{
                background: "hsl(195 30% 14% / 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid hsl(40 20% 96% / 0.08)",
              }}
            >
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "hsl(43 74% 58%)" }} className="text-sm">★</span>
                ))}
              </div>
              <p className="text-primary-foreground/50 text-[12px] leading-relaxed mb-3">
                "An extraordinary culinary journey. Each dish is a masterpiece."
              </p>
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: "hsl(43 74% 58% / 0.7)" }}>
                — Food Critic
              </div>
            </motion.div>

            {/* Main Image — SKILL.md: rounded corners with inner_radius rule */}
            <div className="relative w-full max-w-lg mx-auto">
              {/* outer_radius: 2.5rem, no padding, so image is flush = same radius */}
              <div className="aspect-[4/5] overflow-hidden" style={{ borderRadius: "2.5rem" }}>
                <img
                  src={heroFood}
                  alt="Signature BBQ dish"
                  className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" style={{ borderRadius: "2.5rem" }} />
              </div>
              {/* Warm glow beneath image */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 rounded-full"
                   style={{ background: "hsl(43 60% 50% / 0.12)", filter: "blur(30px)" }} />
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-28 pt-16 border-t"
          style={{ borderColor: "hsl(40 20% 96% / 0.06)" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.12 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-serif font-bold italic"
                   style={{ color: "hsl(43 74% 58%)", letterSpacing: "-0.04em" }}>
                {stat.number}
              </div>
              <div className="text-primary-foreground/25 text-[10px] uppercase tracking-[0.25em] mt-2.5 font-medium">
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
