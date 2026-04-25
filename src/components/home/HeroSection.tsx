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
    <section className="relative min-h-[50vh] md:min-h-[60vh] bg-primary overflow-hidden flex items-center pt-16 pb-8">
      {/* Full-bleed Video Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105" // slight scale to cover edges during blur/overlay
          poster={heroFood}
        >
          {/* High quality cooking/restaurant ambient video or user provided background */}
          <source src="/bg-vdo.mp4" type="video/mp4" />
        </video>
        {/* Vignette and Dark Overlays for professional aesthetic */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(18,20,18,0.85)_100%)]" />

        {/* Subtle golden gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#e9c176]/10 via-transparent to-transparent mix-blend-overlay" />
        {/* Atmospheric warm glows */}
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.08), transparent 70%)" }}
        />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.06), transparent 70%)" }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(40 20% 96% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(40 20% 96% / 0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col justify-center items-center text-center h-full pt-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto flex flex-col items-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-block text-[10px] uppercase tracking-[0.3em] text-primary-foreground/60 font-medium mb-6"
          >
            ✦ Fine Dining Experience
          </motion.span>

          <h1 className="text-[clamp(3rem,8vw,7rem)] font-serif font-bold text-primary-foreground leading-[0.9] mb-6"
            style={{ letterSpacing: "-0.04em" }}>
            Savor
            <br />
            Every <span className="italic relative" style={{ color: "hsl(43 74% 58%)" }}>
              Moment
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[hsl(43_74%_58%)] to-transparent opacity-50" />
            </span>
          </h1>

          <p className="text-primary-foreground/80 text-base md:text-lg max-w-lg mb-10 leading-[1.6] font-light">
            Unlock an explosion of flavors in every bite. Experience culinary artistry in an atmosphere of quiet luxury.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link to="/menu" className="bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold px-10 py-4 rounded-full text-[12px] uppercase tracking-wider shadow-[0_8px_30px_rgba(228,168,32,0.25)] hover:-translate-y-1 transition-all inline-flex items-center gap-2 group">
              Reserve Your Table
              <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5" />
            </Link>
            <Link
              to="/menu"
              className="text-primary-foreground/60 text-[12px] font-bold uppercase tracking-widest hover:text-primary-foreground transition-colors duration-500 flex items-center gap-2 group underline underline-offset-8 decoration-white/20 hover:decoration-white/50"
            >
              Discover Menu
            </Link>
          </div>
        </motion.div>

        {/* Stats Row - Center Aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12 mt-12 pt-6 border-t w-full max-w-4xl"
          style={{ borderColor: "rgba(233, 193, 118, 0.15)" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-3xl md:text-4xl font-serif font-bold italic"
                style={{ color: "hsl(43 74% 58%)", letterSpacing: "-0.03em" }}>
                {stat.number}
              </div>
              <div className="text-primary-foreground/40 text-[9px] uppercase tracking-[0.25em] mt-2 font-medium">
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
