import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import MenuSection from "@/components/home/MenuSection";
import AboutSection from "@/components/home/AboutSection";
import GallerySection from "@/components/home/GallerySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import BlogPreview from "@/components/home/BlogPreview";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <MenuSection />
        <AboutSection />
        <GallerySection />
        <TestimonialsSection />
        <BenefitsSection />
        <BlogPreview />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
