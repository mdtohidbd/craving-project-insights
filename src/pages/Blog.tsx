import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Bell, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: 1,
    title: "Mastering Spices: A Flavorful Guide",
    excerpt: "Transform your meals with the magic of spices. Discover a world of flavors and their unique characteristics.",
    date: "Sep 15, 2024",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
  },
  {
    id: 2,
    title: "Spice Up Your Life",
    excerpt: "Elevate your dishes with the power of spices. Explore a variety of spices and their flavors.",
    date: "Sep 16, 2024",
    image: "https://images.unsplash.com/photo-1532768641073-503a250f9754?w=600",
  },
  {
    id: 3,
    title: "Healthy Eating Made Easy",
    excerpt: "Discover simple and time-saving tips for healthy eating, even with a busy lifestyle.",
    date: "Sep 17, 2024",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
  },
  {
    id: 4,
    title: "The Benefits of Eating Organic",
    excerpt: "Explore the advantages of choosing organic foods. Learn about the environmental impact.",
    date: "Sep 18, 2024",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600",
  },
  {
    id: 5,
    title: "The Ultimate Vegan Guide",
    excerpt: "Discover the world of vegan cuisine with our comprehensive guide to enrich your cooking.",
    date: "Sep 19, 2024",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
  },
  {
    id: 6,
    title: "The Art of Meal Planning",
    excerpt: "Tips for efficient cooking and fermentation. Learn the science behind great flavors.",
    date: "Sep 20, 2024",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-40 pb-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
            style={{ color: "hsl(43 74% 48% / 0.8)" }}
          >
            ✦ Journal & Insights
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-8xl lg:text-9xl font-serif font-bold text-primary-foreground leading-[0.9] mb-8"
            style={{ letterSpacing: "-0.04em", color: "hsl(40 20% 96%)" }}
          >
            Foodie
            <br />
            <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Journal</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl mx-auto text-[18px] leading-[1.8]"
            style={{ color: "hsl(40 20% 96% / 0.5)" }}
          >
            From behind-the-scenes stories to expert cooking techniques,
            these stories are crafted to inspire your culinary journey.
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section-divide relative" style={{ background: "hsl(40 18% 96%)" }}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group"
              >
                <Link to={`/blog/${post.id}`} className="block">
                  <div className="relative overflow-hidden mb-8 shadow-sm" style={{ borderRadius: "2rem" }}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-[320px] object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-6 left-6">
                      <span className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 font-bold backdrop-blur-md rounded-full shadow-sm"
                            style={{ background: "hsl(40 20% 96% / 0.9)", color: "hsl(195 30% 12%)" }}>
                        {post.date}
                      </span>
                    </div>

                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                           style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}>
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-primary mb-3 transition-colors duration-300 group-hover:opacity-80">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-[16px] leading-[1.7] opacity-90 pr-4">
                    {post.excerpt}
                  </p>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Read Our Blog Section */}
      <section className="section-divide relative overflow-hidden" style={{ background: "hsl(38 15% 92% / 0.3)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="overflow-hidden shadow-2xl max-w-xl mx-auto" style={{ borderRadius: "3rem" }}>
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"
                  alt="Delicious food"
                  className="w-full h-[550px] object-cover transition-transform duration-[2s] hover:scale-105"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
                    style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                ✦ Stay Connected
              </span>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary mb-12 leading-[0.9]"
                  style={{ letterSpacing: "-0.04em" }}>
                Read Our
                <br />
                <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Blog</span>
              </h2>

              <div className="space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-sm"
                       style={{ background: "hsl(40 18% 96%)", borderRadius: "1.5rem", border: "1px solid hsl(38 12% 88%)" }}>
                    <BookOpen className="w-6 h-6" style={{ color: "hsl(43 74% 48%)" }} />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-serif font-bold text-2xl text-primary mb-2">
                      Gain valuable insights
                    </h4>
                    <p className="text-muted-foreground text-[16px] leading-[1.8] max-w-sm">
                      Learn directly from expert executive chefs and gain unique industry perspectives.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-sm"
                       style={{ background: "hsl(40 18% 96%)", borderRadius: "1.5rem", border: "1px solid hsl(38 12% 88%)" }}>
                    <Bell className="w-6 h-6" style={{ color: "hsl(43 74% 48%)" }} />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-serif font-bold text-2xl text-primary mb-2">
                      Stay informed
                    </h4>
                    <p className="text-muted-foreground text-[16px] leading-[1.8] max-w-sm">
                      Keep up with the latest seasonal openings, menus, and culinary trends.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
