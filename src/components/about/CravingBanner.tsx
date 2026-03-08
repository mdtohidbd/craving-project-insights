import { motion } from "framer-motion";

const CravingBanner = () => {
  return (
    <section className="py-20 bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/[0.05] blur-3xl" />
      </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-7xl md:text-9xl font-serif font-bold text-primary/10 italic select-none">
            Craving
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default CravingBanner;
