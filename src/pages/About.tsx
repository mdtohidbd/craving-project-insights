import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Sparkles, Shield, Heart, Award } from "lucide-react";
import chefImage from "@/assets/chef.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";

const stats = [
  { number: "500+", label: "Restaurants" },
  { number: "100+", label: "Fresh Ingredients" },
  { number: "5★", label: "Star Rating" },
  { number: "200+", label: "Happy Reviews" },
];

const whyChoose = [
  {
    title: "Passion for Food",
    content: "Our chefs truly live for culinary excellence. We know food is much more than a meal—it's an experience that brings people together.",
  },
  {
    title: "Commitment to Quality",
    content: "We source only the finest ingredients from trusted artisans, ensuring every dish meets our exacting standards of perfection.",
  },
  {
    title: "Customer First",
    content: "Your happiness is our priority. We go above and beyond to ensure every visit exceeds your expectations in every way.",
  },
];

const benefits = [
  { icon: Sparkles, text: "A Diverse Selection of Cuisines" },
  { icon: Shield, text: "Quality Guaranteed Every Time" },
  { icon: Heart, text: "Crafted with Love & Precision" },
  { icon: Award, text: "Award-Winning Experience" },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-20 pb-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[0%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-4 block"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
              ✦ Our Journey
            </span>
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-serif font-bold text-primary-foreground leading-[0.9] mb-4"
                style={{ letterSpacing: "-0.04em" }}>
              The Story of
              <br />
              <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Craving</span>
            </h1>
            <p className="max-w-xl mx-auto text-[18px] leading-[1.8]"
               style={{ color: "hsl(40 20% 96% / 0.85)" }}>
              Discover our steadfast commitment to the highest quality food and
              creating unforgettable dining experiences for every guest.
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative overflow-hidden shadow-2xl" style={{ borderRadius: "3rem" }}>
              <img
                src={chefImage}
                alt="Chef preparing food"
                className="w-full h-[450px] md:h-[600px] object-cover transition-transform [transition-duration:2s] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-serif font-bold italic mb-2"
                     style={{ color: "hsl(43 74% 48%)", letterSpacing: "-0.04em" }}>
                  {stat.number}
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] font-medium"
                     style={{ color: "hsl(40 20% 96% / 0.4)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section-divide relative" style={{ background: "hsl(40 18% 96%)" }}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="overflow-hidden aspect-square max-w-md mx-auto shadow-xl" style={{ borderRadius: "3rem" }}>
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"
                  alt="Restaurant ambiance"
                  className="w-full h-full object-cover transition-transform [transition-duration:2s] hover:scale-105"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-3 block"
                    style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                ✦ Our Difference
              </span>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary mb-3 leading-[0.9]"
                  style={{ letterSpacing: "-0.04em" }}>
                Experience the
                <br />
                Unique <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Craving</span>
              </h2>
              <p className="text-muted-foreground text-[16px] leading-[1.8] mb-4 max-w-md">
                At Craving, we believe there's something for every discerning taste.
                Whether it's a quick meal on-the-go or a special anniversary,
                we perfectly satisfy every craving.
              </p>
              <p className="text-muted-foreground text-[16px] leading-[1.8] mb-5 max-w-md">
                We're not just another fine dining restaurant — we're your culinary
                companions. From discovering bold new flavors to mastering authentic classic
                dishes, expect nothing less than an absolute feast.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-4 text-sm font-medium transition-colors duration-300 group"
                style={{ color: "hsl(43 74% 48%)" }}
              >
                <span className="text-[12px] uppercase tracking-[0.2em]">
                  Get in Touch
                </span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose - Accordion & Benefits */}
      <section className="section-divide relative" style={{ background: "hsl(38 15% 92% / 0.3)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" 
             style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />
             
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-3 block"
                    style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                ✦ Why We Stand Out
              </span>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary mb-5 leading-[0.9]"
                  style={{ letterSpacing: "-0.04em" }}>
                Why Choose
                <br />
                <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Craving?</span>
              </h2>

              <Accordion
                type="single"
                collapsible
                className="w-full mb-5"
                defaultValue="item-0"
              >
                {whyChoose.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-border/50 py-2"
                  >
                    <AccordionTrigger className="text-primary font-serif font-bold text-[20px] hover:no-underline hover:text-accent transition-colors">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-[1.8] text-[15px] max-w-sm mt-2">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="space-y-4 pt-5 border-t border-border/50">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-5 group"
                  >
                    <span className="text-foreground font-serif font-bold text-[18px]">
                      {benefit.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="overflow-hidden max-w-lg mx-auto shadow-2xl" style={{ borderRadius: "3rem" }}>
                <img
                  src={menuShrimp}
                  alt="Delicious shrimp"
                  className="w-full h-full object-cover transition-transform [transition-duration:2s] hover:scale-105"
                  style={{ minHeight: "800px" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
