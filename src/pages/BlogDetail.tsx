import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: "1",
    title: "Mastering Spices: A Flavorful Guide",
    excerpt: "Transform your meals with the magic of spices.",
    date: "Sep 15, 2024",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200",
    content: `
## Introduction:

Spices are the essence that transforms ordinary ingredients into flavorful masterpieces. They are the secret weapon in the culinary world, adding depth and character to every meal. Mastering the use of spices is not just about following recipes—it's about understanding their unique properties and how they interact with other flavors to create culinary magic.

Think about it: the same base ingredients can taste completely different based on the spices you choose. A simple piece of chicken can become Indian curry, Mexican fajitas, or Mediterranean kebab—all depending on your spice selection.

## Understanding Spices:

Spices come from various parts of plants—roots, bark, seeds, and even leaves. Understanding their origins helps you appreciate their distinct flavors.

- **Origins of Spices:** Spices can come from various regions around the globe, such as the Silk Road era, Gotta, Kerala, and more.
- **Types of Spices:**
  - **Warm Spices:** Cinnamon, cloves, nutmeg, and sweet aromatic depth
  - **Pungent Spices:** Black pepper, mustard seeds, ginger, and wasabi add heat
  - **Aromatic Spices:** Cardamom, fennel, cumin provide earthy to floral notes
  - **Flavor Profiles:** Bay, oregano, thyme, basil and rosemary add depth

## Mastering Spice Blends:

Spice blends are combinations of complementary spices that form the base of great dishes. Understanding popular blends helps you create more complex flavors.

- **Popular Spice Blends:**
  - **Garam Masala (Indian):** A warm blend of cinnamon, cardamom, and cloves
  - **Herbes de Provence (French):** A fragrant mix of thyme, rosemary, and lavender
  - **Cajun Seasoning (Southern USA):** A bold, paprika-cayenne, garlic mix
  - **Ras el Hanout (Moroccan):** A complex, sweeping spice of flavors

## Tips for Cooking with Spices:

- **Toasting Spices:** Toast whole spices in a dry pan before grinding
- **Blooming Spices:** Toast ground spices in oil to release their aromas
- **Layering Flavors:** Add spices at different stages of cooking
- **Balancing Heat:** Add cooling ingredients to balance spicy dishes
- **Experimentation:** Don't be afraid to experiment—the best cooks are explorers

## Storing and Preserving Spices:

Proper storage extends the potency and freshness of your spices:

- **Store in Airtight Containers:** Keep spices away from light and moisture
- **Avoid Heat and Light:** Store spices in cool, dark spaces away from the stove
- **Label and Rotate:** Label with purchase dates; use older spices first
- **Refresh Fresh When Possible:** Crushing or grinding just before use ensures maximum flavor

## Conclusion:

Mastering spices opens up endless culinary possibilities. By experimenting with different spice blending flavors, you can transform simple ingredients into culinary delights. Happy cooking!
    `,
  },
  {
    id: "2",
    title: "Spice Up Your Life, A Guide to Different Spices",
    excerpt: "Elevate your dishes with the power of spices.",
    date: "Sep 16, 2024",
    image: "https://images.unsplash.com/photo-1532768641073-503a250f9754?w=1200",
    content: "A comprehensive guide to spices from around the world...",
  },
  {
    id: "3",
    title: "Healthy Eating Made Easy, Tips for Busy People",
    excerpt: "Discover simple tips for healthy eating.",
    date: "Sep 17, 2024",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
    content: "Learn how to eat healthy even with a busy schedule...",
  },
];

const BlogDetail = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-4xl font-serif font-bold text-primary">Post Not Found</h1>
          <Link to="/blog" className="btn-orange inline-block mt-8">
            Back to Blog
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
      <section className="bg-primary pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="bg-accent text-accent-foreground text-sm font-medium px-4 py-1 rounded-full">
              {post.date}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-4"
          >
            {post.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary-foreground/70 max-w-2xl mx-auto"
          >
            {post.excerpt}
          </motion.p>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-3xl overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto prose prose-lg prose-headings:font-serif prose-headings:text-primary prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
          >
            <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {post.content}
            </div>
          </motion.article>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-primary text-center mb-12">
            View More Blog
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((relPost, index) => (
              <motion.article
                key={relPost.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/blog/${relPost.id}`}>
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img
                      src={relPost.image}
                      alt={relPost.title}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-card/90 backdrop-blur-sm text-card-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {relPost.date}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                    {relPost.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {relPost.excerpt}
                  </p>
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
