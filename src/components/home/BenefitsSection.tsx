import { motion } from "framer-motion";
import { Sparkles, Shield, Heart, Truck } from "lucide-react";
import menuShrimp from "@/assets/menu-shrimp.jpg";

const benefits = [
  {
    icon: Sparkles,
    title: "Premium Ingredients",
    description: "Sourced fresh daily from trusted local farmers and artisans.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Every dish meets our exacting standards of excellence.",
  },
  {
    icon: Heart,
    title: "Crafted with Love",
    description: "Our chefs pour precision and passion into every single creation.",
  },
  {
    icon: Truck,
    title: "Swift Delivery",
    description: "Hot, fresh, and perfectly plated — delivered right to your doorstep.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="section-divide relative overflow-hidden"
             style={{ background: "hsl(38 15% 92% / 0.3)" }}>
      {/* Decorative Warm Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative overflow-hidden shadow-2xl" style={{ borderRadius: "3rem" }}>
              <img
                src={menuShrimp}
                alt="Premium dish"
                className="w-full h-[600px] object-cover transition-transform [transition-duration:2s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>
            
            {/* Floating stat */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 left-6 md:left-12 bg-card p-8 shadow-2xl"
              style={{ borderRadius: "1.5rem" }}
            >
              <div className="text-center">
                <div className="text-5xl font-serif font-bold italic mb-1" style={{ color: "hsl(43 74% 48%)" }}>
                  98%
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-medium"
                     style={{ color: "hsl(195 30% 12%)" }}>
                  Satisfaction Rate
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
            className="order-1 lg:order-2"
          >
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-3 block"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
              ✦ Why Choose Us
            </span>
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary mb-4 md:mb-6 leading-[1.1]"
                style={{ letterSpacing: "-0.04em" }}>
              The Craving <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Difference</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 lg:space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-start gap-6 group"
                >
                  <div className="pt-1.5 flex-1">
                    <h4 className="font-serif font-bold text-2xl text-primary mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-muted-foreground text-[16px] leading-[1.8] max-w-sm">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
