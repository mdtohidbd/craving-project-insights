import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";
import chefImage from "@/assets/chef.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import CTASection from "@/components/about/CTASection";
import CravingBanner from "@/components/about/CravingBanner";

const stats = [
  { number: "500+", label: "Restaurants" },
  { number: "100+", label: "Fresh Ingredients" },
  { number: "5", label: "Star Rating" },
  { number: "200+", label: "Customer Reviews" },
];

const whyChoose = [
  {
    title: "Passion for Food",
    content: "Our chefs truly live for diving into culinary everything we do. We know that food is much more than just a meal—it's an experience."
  },
  {
    title: "Commitment to Quality",
    content: "We source only the finest ingredients from trusted suppliers, ensuring every dish meets our exacting standards."
  },
  {
    title: "Customer Satisfaction",
    content: "Your happiness is our priority. We go above and beyond to ensure every visit exceeds your expectations."
  },
];

const benefits = [
  "A Diverse Selection of Restaurants & Available",
  "Easy Calls with a Simple File",
  "Vibrant Food Finder",
  "Customer Satisfaction Guaranteed",
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary-foreground mb-4">
              Craving's Story
            </h1>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Discover our commitment to providing the highest quality food. Learn
              about our sourcing practices, food safety standards.
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-3xl overflow-hidden">
              <img
                src={chefImage}
                alt="Chef preparing food"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="stat-number">{stat.number}</div>
                <div className="text-primary-foreground/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-[50%] overflow-hidden aspect-square max-w-md mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"
                  alt="Restaurant ambiance"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-serif font-bold text-primary mb-6">
                Experience the Unique Craving Difference
              </h2>
              <p className="text-muted-foreground mb-6">
                At Craving, we believe there's something for your taste. Whether it's a
                quick meal on-a-go or a special date, we satisfy every craving.
              </p>
              <p className="text-muted-foreground mb-8">
                With Craving we're not just another listing service, we're your
                companions. We aim for the perfect harmony. We help you spot all new cafes
                around to make sure you're not just a destination away. Expect nothing but
                a feast. Also if anything isn't correct to us that you expected, talk to us,
                we'll fix it.
              </p>
              <Link to="/contact" className="btn-orange inline-block">
                Get in Touch
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Craving Banner */}
      <CravingBanner />

      {/* Why Choose Section with Accordion */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-serif font-bold text-primary mb-8">
                Why Choose Craving?
              </h2>
              <p className="text-muted-foreground mb-6">
                Craving brings your delight you to check the food experiences and
                satisfying food delivery experience every single time.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                {whyChoose.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-border">
                    <AccordionTrigger className="text-primary font-semibold hover:text-accent">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-[50%] overflow-hidden aspect-square max-w-md mx-auto">
                <img
                  src={menuShrimp}
                  alt="Delicious shrimp"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-[50%] overflow-hidden aspect-square max-w-md mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"
                  alt="Tacos"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-serif font-bold text-primary mb-6">
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

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  );
};

export default About;
