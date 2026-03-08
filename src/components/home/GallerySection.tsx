import { motion } from "framer-motion";

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    alt: "Gourmet Salad",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    alt: "Grilled Meat",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600",
    alt: "Fresh Dessert",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
    alt: "Plated Dish",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    alt: "Fresh Bowl",
    span: "md:col-span-1 md:row-span-1",
  },
];

const GallerySection = () => {
  return (
    <section className="section-divide relative overflow-hidden"
             style={{ background: "hsl(195 32% 7%)" }}>
      {/* Atmospheric glow — Warm/Gold to contrast dark forest background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
                style={{ color: "hsl(43 74% 48% / 0.8)" }}>
            ✦ Visual Journey
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.9]"
              style={{ color: "hsl(40 20% 96%)", letterSpacing: "-0.04em" }}>
            Food as
            <br />
            <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Art</span>
          </h2>
        </motion.div>

        {/* Gallery Grid - Perfect Bento Box */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[200px] md:auto-rows-[280px]">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative overflow-hidden group cursor-pointer ${image.span}`}
              style={{ borderRadius: "1.5rem" }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              {/* Hover overlay with text */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end p-8">
                <span className="text-[15px] font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700"
                      style={{ color: "hsl(40 20% 96%)", letterSpacing: "0.05em" }}>
                  {image.alt}
                </span>
                {/* Micro accent line on hover */}
                <div className="absolute bottom-8 left-8 w-0 h-[1px] bg-accent transition-all duration-700 group-hover:w-8 mt-6" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
