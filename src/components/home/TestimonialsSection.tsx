import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const TestimonialsSection = () => {
  const { settings } = useSettings();

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Food Blogger",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      text: "This restaurant delivers quality when it comes to atmosphere, service, and taste. The grilled fish was absolutely delicious.",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Regular Guest",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      text: "Amazing experience! The ambiance is perfect for a romantic dinner. The chef really knows how to bring out the best flavors.",
    },
    {
      id: 3,
      name: "Emma Williams",
      role: "Food Critic",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      text: `${settings.websiteName} has redefined my expectations for fine dining. Every visit is a new adventure in taste. Highly recommend!`,
    },
  ];
  return (
    <section className="section-divide relative overflow-hidden"
             style={{ background: "hsl(40 18% 96%)" }}>
      
      {/* Decorative Warm Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" 
           style={{ background: "radial-gradient(circle, hsl(38 15% 90% / 0.5), transparent 70%)" }} />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-10"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-3 block"
                style={{ color: "hsl(43 74% 48% / 0.8)" }}>
            ✦ Guest Voices
          </span>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary leading-[1.1]"
              style={{ letterSpacing: "-0.04em" }}>
            Words of <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Appreciation</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative menu-card group p-10 lg:p-12 h-full flex flex-col"
              style={{ borderRadius: "1.5rem" }}
            >
              <Quote className="w-10 h-10 mb-8 transition-colors duration-500" 
                     style={{ color: "hsl(43 74% 48% / 0.2)" }} />

              <p className="text-muted-foreground leading-[1.8] flex-grow mb-10 text-[16px] italic pr-4">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-5 mt-auto">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-card"
                       style={{ background: "hsl(43 74% 48%)" }} />
                </div>
                <div>
                  <div className="font-serif font-bold text-primary text-lg mb-0.5">
                    {testimonial.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-70"
                       style={{ color: "hsl(195 30% 12%)" }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
