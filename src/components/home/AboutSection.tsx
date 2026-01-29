import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import chefImage from "@/assets/chef.jpg";

const AboutSection = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src={chefImage}
                alt="Our Chef"
                className="w-full h-[500px] object-cover"
              />
              {/* Decorative Badge */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-primary">5★</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">
              At Craving we joyfully
              <br />
              celebrate flavor and connect
              <br />
              you with the best local
              <br />
              restaurants.
            </h2>
            <p className="text-muted-foreground mb-8">
              Crafted by top culinary experts, our bold recipes turn every meal
              into an unforgettable experience. From gourmet dishes to street
              food favorites, we deliver flavor that speaks to your soul.
            </p>
            <Link to="/about" className="btn-orange inline-block">
              About Craving
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
