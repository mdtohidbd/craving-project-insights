import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroFood from "@/assets/hero-food.jpg";

const stats = [
  { number: "500+", label: "Restaurants" },
  { number: "100+", label: "Fresh Ingredients" },
  { number: "5", label: "Star Rating" },
  { number: "200+", label: "Customer Reviews" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
              Make a Moment
              <br />
              with <span className="text-accent">Craving</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md mb-8">
              Unlock an explosion of flavors in every bite! At Craving,
              Our handpicked selections of bold and delicious food will
              leave you craving for more.
            </p>
            <Link to="/contact" className="btn-orange inline-block">
              Book a Table
            </Link>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Testimonial Card */}
            <div className="absolute top-0 right-0 md:right-10 z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-xs border border-white/20">
              <p className="text-white/80 text-sm italic mb-2">
                "This restaurant is truly the stuff of legends. Only the freshest
                and highest quality dishes. The food is out-of-this-world
                fantastic."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/30" />
                <span className="text-white text-sm font-medium">Food Critic</span>
              </div>
            </div>

            {/* Main Image with Oval Mask */}
            <div className="relative w-full max-w-lg mx-auto">
              <div className="aspect-square rounded-[40%] overflow-hidden border-4 border-white/10">
                <img
                  src={heroFood}
                  alt="Delicious BBQ Ribs"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="stat-number">{stat.number}</div>
              <div className="text-white/60 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
