import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Bell } from "lucide-react";
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
    title: "Spice Up Your Life, A Guide to Different Spices",
    excerpt: "Elevate your dishes with the power of spices. Explore a variety of spices, their flavors.",
    date: "Sep 16, 2024",
    image: "https://images.unsplash.com/photo-1532768641073-503a250f9754?w=600",
  },
  {
    id: 3,
    title: "Healthy Eating Made Easy, Tips for Busy People",
    excerpt: "Discover simple and time-saving tips for healthy eating, even with a busy lifestyle of your city life.",
    date: "Sep 17, 2024",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
  },
  {
    id: 4,
    title: "The Benefits of Eating Organic, A Closer Look",
    excerpt: "Explore the advantages of choosing organic foods. Learn about the environmental.",
    date: "Sep 18, 2024",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600",
  },
  {
    id: 5,
    title: "The Ultimate Guide to Vegan Cook on Craving",
    excerpt: "Discover the world of vegan cuisine with our comprehensive guide to enrich your cooking.",
    date: "Sep 19, 2024",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
  },
  {
    id: 6,
    title: "The Art of Meal Planning, Tips for Efficient Cooking",
    excerpt: "Explore the fascinating world of fermentation. Learn about the science behind.",
    date: "Sep 20, 2024",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-serif font-bold text-primary-foreground mb-4"
          >
            Our Foodie Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary-foreground/70 max-w-2xl mx-auto"
          >
            Our blog is your go-to destination for all things food. From delicious recipes
            to helpful cooking tips, we've got you covered.
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/blog/${post.id}`}>
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-card/90 backdrop-blur-sm text-card-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {post.date}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-forest-light transition-colors">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* Read Our Blog Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"
                  alt="Delicious food"
                  className="w-full h-[400px] object-cover"
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
                Read Our Blog
              </h2>
              <p className="text-muted-foreground mb-8">
                Our blog empowers you with valuable information
                and insightful perspectives.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Gain valuable insights</h4>
                    <p className="text-muted-foreground text-sm">
                      Learn from expert advice and industry insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Stay informed</h4>
                    <p className="text-muted-foreground text-sm">
                      Keep up-to-date with the latest news and trends.
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
