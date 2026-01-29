import { motion } from "framer-motion";

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    alt: "Gourmet Salad",
  },
  {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    alt: "Grilled Meat",
  },
  {
    url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600",
    alt: "Fresh Dessert",
  },
  {
    url: "https://images.unsplash.com/photo-1482049016gy-2a1a7a5k93s?w=600",
    alt: "Cocktail",
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
    alt: "Plated Dish",
  },
  {
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
    alt: "Fresh Bowl",
  },
];

const GallerySection = () => {
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
            Our Food Gallery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a visual journey through our culinary creations. Each dish is a work
            of art, crafted with passion and precision.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl group ${
                index === 0 || index === 5 ? "md:col-span-1 md:row-span-2" : ""
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  index === 0 || index === 5 ? "h-full min-h-[300px]" : "h-48 md:h-56"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
