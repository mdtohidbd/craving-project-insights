import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: "1",
    title: "Mastering Spices: A Flavorful Guide",
    excerpt: "Transform your meals with the magic of spices.",
    date: "Sep 15, 2024",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200",
    content: `## Introduction

Spices are the essence that transforms ordinary ingredients into flavorful masterpieces. They are the secret weapon in the culinary world, adding depth and character to every meal. Mastering the use of spices is not just about following recipes—it's about understanding their unique properties.

Think about it: the same base ingredients can taste completely different based on the spices you choose. A simple piece of chicken can become Indian curry, Mexican fajitas, or Mediterranean kebab.

## Understanding Spices

Spices come from various parts of plants—roots, bark, seeds, and even leaves. Understanding their origins helps you appreciate their distinct flavors.

- **Warm Spices:** Cinnamon, cloves, nutmeg — sweet aromatic depth
- **Pungent Spices:** Black pepper, mustard seeds, ginger — fiery heat
- **Aromatic Spices:** Cardamom, fennel, cumin — earthy to floral notes
- **Herbal:** Bay, oregano, thyme, basil — Mediterranean depth

## Mastering Spice Blends

Spice blends are combinations of complementary spices that form the base of great dishes.

- **Garam Masala:** A warm blend of cinnamon, cardamom, and cloves
- **Herbes de Provence:** Thyme, rosemary, and lavender
- **Cajun Seasoning:** Bold paprika-cayenne and garlic mix
- **Ras el Hanout:** A complex Moroccan spice symphony

## Tips for Cooking with Spices

- Toast whole spices in a dry pan before grinding
- Bloom ground spices in oil to release aromas
- Layer flavors by adding spices at different stages
- Balance heat with cooling ingredients
- Experiment fearlessly — the best cooks are explorers

## Storing Spices

- Store in airtight containers away from light
- Keep cool — avoid storing near the stove
- Label with purchase dates; rotate stock
- Grind fresh when possible for maximum flavor

## Conclusion

Mastering spices opens up endless possibilities. Experiment with different blends, trust your palate, and transform simple ingredients into culinary art.`,
  },
  {
    id: "2",
    title: "Spice Up Your Life",
    excerpt: "Elevate your dishes with the power of spices.",
    date: "Sep 16, 2024",
    image: "https://images.unsplash.com/photo-1532768641073-503a250f9754?w=1200",
    content: "A comprehensive guide to spices from around the world. Explore the rich history and vibrant flavors that have shaped cuisines across continents.",
  },
  {
    id: "3",
    title: "Healthy Eating Made Easy",
    excerpt: "Discover simple tips for healthy eating.",
    date: "Sep 17, 2024",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    content: "Learn how to eat healthy even with a busy schedule. Meal prep strategies, quick recipes, and nutrition tips for the modern lifestyle.",
  },
];

const BlogDetail = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary relative overflow-hidden">
        <Navbar />
        <div className="pt-40 pb-20 text-center relative z-10">
          <h1 className="text-8xl font-serif font-bold text-primary-foreground mb-8" style={{ letterSpacing: "-0.04em" }}>
            Post Not Found
          </h1>
          <Link to="/blog" className="btn-gold inline-flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" /> Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.id !== id).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-40 pb-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold px-6 py-2.5 rounded-full"
                  style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}>
              {post.date}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-primary-foreground leading-[0.9] mb-8 max-w-4xl mx-auto"
            style={{ letterSpacing: "-0.04em" }}
          >
            {post.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary-foreground/50 max-w-xl mx-auto text-[18px] leading-[1.8]"
          >
            {post.excerpt}
          </motion.p>
        </div>
      </section>

      {/* Featured Image */}
      <section className="bg-background pt-16">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto"
            style={{ marginTop: "-120px", position: "relative", zIndex: 20 }}
          >
            <div className="rounded-[3rem] overflow-hidden shadow-2xl">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-[500px] md:h-[650px] object-cover transition-transform [transition-duration:2s] hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-headings:text-primary 
                            prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:text-[17px] 
                            prose-li:text-muted-foreground prose-strong:text-foreground 
                            prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8
                            prose-ul:space-y-3 prose-li:text-[17px] prose-li:leading-[1.8]">
              <div className="whitespace-pre-line">
                {post.content}
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Related Posts */}
      <section className="section-divide relative" style={{ background: "hsl(38 15% 92% / 0.3)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-[0%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
                    style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                ✦ Keep Reading
              </span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-primary"
                  style={{ letterSpacing: "-0.04em" }}>
                More <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Stories</span>
              </h2>
            </div>
            
            <Link
              to="/blog"
              className="hidden md:inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 group"
              style={{ color: "hsl(43 74% 48%)" }}
            >
              All Posts
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {relatedPosts.map((relPost, index) => (
              <motion.article
                key={relPost.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/blog/${relPost.id}`} className="block h-full">
                  <div className="menu-card h-full rounded-[2rem] overflow-hidden">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={relPost.image}
                        alt={relPost.title}
                        className="w-full h-full object-cover transition-transform [transition-duration:1.5s] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute top-5 left-5">
                        <span className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 font-bold backdrop-blur-md rounded-full shadow-sm"
                              style={{ background: "hsl(40 20% 96% / 0.9)", color: "hsl(195 30% 12%)" }}>
                          {relPost.date}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <h3 className="text-2xl font-serif font-bold text-primary mb-3 transition-colors duration-300 group-hover:text-accent">
                        {relPost.title}
                      </h3>
                      <p className="text-muted-foreground text-[15px] line-clamp-2 leading-[1.8] opacity-90 pr-4">
                        {relPost.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogDetail;
