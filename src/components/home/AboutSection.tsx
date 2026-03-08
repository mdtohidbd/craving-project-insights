import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import chefImage from "@/assets/chef.jpg";

const AboutSection = () => {
  return (
    <section className="section-divide relative overflow-hidden"
             style={{ background: "hsl(38 15% 92% / 0.3)" }}>
      {/* Decorative Warm Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.03), transparent 70%)" }} />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* outer_radius: 3rem, no padding = inner_radius: 3rem */}
            <div className="relative overflow-hidden" style={{ borderRadius: "3rem" }}>
              <img
                src={chefImage}
                alt="Our Head Chef"
                className="w-full h-[550px] object-cover transition-transform duration-[2s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-6 -right-2 md:right-8 bg-accent p-6 shadow-2xl"
              style={{ borderRadius: "1.5rem" }}
            >
              <div className="text-accent-foreground text-center">
                <div className="text-4xl font-serif font-bold mb-0.5">15+</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-80">
                  Years
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
              ✦ Our Philosophy
            </span>
            <h2 className="text-5xl lg:text-6xl font-serif font-bold text-primary mb-8 leading-[0.95]"
                style={{ letterSpacing: "-0.035em" }}>
              Where Passion
              <br />
              Meets <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Flavor</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-[1.8] mb-12 max-w-md">
              At Craving, we celebrate the art of cooking. Our chefs turn
              every meal into an unforgettable experience — from gourmet
              dishes to street food favorites, carefully crafted to delight your senses.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-3 text-sm font-medium transition-colors duration-300 group"
              style={{ color: "hsl(43 74% 48%)" }}
            >
              <span className="text-[12px] uppercase tracking-[0.2em]">
                Discover Our Story
              </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
