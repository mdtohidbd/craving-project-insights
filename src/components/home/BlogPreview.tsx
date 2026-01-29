import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
];

const BlogPreview = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            Craving Foodie Blog
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover secret recipes, cooking hacks, tips, and much more
            on our blog. Stay Hungry, Learn More.
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-3 gap-8">
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
                {/* Image */}
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-primary text-xs font-medium px-3 py-1 rounded-full">
                      {post.date}
                    </span>
                  </div>
                </div>

                {/* Content */}
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
      </div>
    </section>
  );
};

export default BlogPreview;
