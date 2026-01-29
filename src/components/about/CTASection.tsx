import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-4">
            Hungry? Visit Now!
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Whether you're craving a quick bite, a gourmet meal, or something in between,
            Craving has you covered. From classic comfort food to exotic international flavors.
          </p>
          <Link to="/contact" className="btn-orange inline-block">
            Get In Touch
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
