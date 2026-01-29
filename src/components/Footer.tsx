import { Link } from "react-router-dom";
import { ChefHat, Facebook, Twitter, Instagram, Globe } from "lucide-react";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Menu", path: "/menu" },
  { name: "Contact", path: "/contact" },
];

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      {/* CTA Section */}
      <div className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Hungry? Visit Now!
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Whether you're craving a quick bite, a gourmet meal, or something in between.
            Craving has you covered. From classic comfort food to exotic.
          </p>
          <Link to="/contact" className="btn-orange inline-block">
            Get in Touch
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <ChefHat className="w-8 h-8 text-accent" />
                <span className="text-2xl font-serif font-bold">Craving</span>
              </Link>
              <p className="text-white/60 text-sm">
                We're also active on social media! Follow us for engaging industry updates.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/60 text-sm hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3 text-white/60 text-sm">
                <li>2464 Royal Ln, Mesa, NJ</li>
                <li>(629) 555-0129</li>
                <li>tanya.hill@example.com</li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">More</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-accent"
                />
                <button className="btn-orange px-6 py-2 text-sm">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © Copyright 2024. All Rights Reserved by FramerWebPro
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/50 hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/50 hover:text-accent transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
