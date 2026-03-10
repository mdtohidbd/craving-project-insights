import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920')",
        }}
      />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[11px] uppercase tracking-[0.3em] text-accent/80 font-medium mb-4 block">
            Don't Wait Any Longer
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-primary-foreground mb-4 leading-[0.95]">
            Hungry?
            <br />
            <span className="italic text-accent">Visit Now!</span>
          </h2>
          <p className="text-primary-foreground/50 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
            Whether you're craving a quick bite, a gourmet meal, or something in between,
            Craving has you covered.
          </p>
          <Link
            to="/contact"
            className="btn-gold inline-flex items-center gap-3 group"
          >
            Get In Touch
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
