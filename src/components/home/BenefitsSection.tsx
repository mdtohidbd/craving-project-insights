import { motion } from "framer-motion";
import { Check, Utensils } from "lucide-react";
import menuShrimp from "@/assets/menu-shrimp.jpg";

const benefits = [
  "A Diverse Selection of Restaurants & Available",
  "Easy Calls with a Simple File",
  "Vibrant Food Finder",
  "Customer Satisfaction Guaranteed",
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              <div className="rounded-3xl overflow-hidden">
                <img
                  src={menuShrimp}
                  alt="Delicious Food"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl p-6 shadow-xl max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-semibold text-card-foreground">Quality Food</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Every dish is prepared with premium ingredients and expert technique.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
              Why Choose Craving?
            </h2>
            <p className="text-muted-foreground mb-8">
              Craving brings you a diverse range of the best food experiences and
              satisfying food delivery experience every single time.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
