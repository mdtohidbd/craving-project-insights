import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Mastering Spices: A Flavorful Guide",
    excerpt: "Transform your meals with the magic of spices. Discover a world of flavors.",
    date: "Sep 15, 2024",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
  },
  {
    id: 2,
    title: "Spice Up Your Life",
    excerpt: "Elevate your dishes with the power of spices and their unique characteristics.",
    date: "Sep 16, 2024",
    image: "https://images.unsplash.com/photo-1532768641073-503a250f9754?w=600",
  },
  {
    id: 3,
    title: "Healthy Eating Made Easy",
    excerpt: "Simple and time-saving tips for healthy eating, even with a busy lifestyle.",
    date: "Sep 17, 2024",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
  },
];

const BlogPreview = () => {
  return (
    <section className="section-divide relative overflow-hidden" style={{ background: "hsl(40 18% 96%)" }}>
      {/* Decorative Warm Glow */}
      <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 md:mb-24"
        >
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
              ✦ From the Kitchen
            </span>
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary leading-[0.9]"
                style={{ letterSpacing: "-0.04em" }}>
              Latest
              <br />
              <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Stories</span>
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 group"
            style={{ color: "hsl(43 74% 48%)" }}
          >
            View All Posts
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group"
            >
              <Link to={`/blog/${post.id}`} className="block">
                {/* Image */}
                <div className="relative overflow-hidden mb-8 shadow-sm" style={{ borderRadius: "2rem" }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-[320px] object-cover transition-transform [transition-duration:1.5s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Date Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 font-bold backdrop-blur-md rounded-full shadow-sm"
                          style={{ background: "hsl(40 20% 96% / 0.9)", color: "hsl(195 30% 12%)" }}>
                      {post.date}
                    </span>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                         style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
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
  );
};

export default BlogPreview;
