import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

const CravingBanner = () => {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <ChefHat className="w-10 h-10 text-primary" />
          <span className="text-4xl md:text-5xl font-serif font-bold text-primary italic">
            Craving
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default CravingBanner;
