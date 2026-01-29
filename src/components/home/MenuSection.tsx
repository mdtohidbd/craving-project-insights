import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

import menuMojito from "@/assets/menu-mojito.jpg";
import menuCoconut from "@/assets/menu-coconut.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import menuDessert from "@/assets/menu-dessert.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import heroFood from "@/assets/hero-food.jpg";

const menuItems = [
  {
    id: 1,
    title: "BBQ Grilled Ribs",
    price: "$18.99",
    image: heroFood,
    category: "Non-Veg",
    description: "To die-for meat recipe for ribs, our BBQ ribs! Ribs are glazed with a savory-sweet barbecue.",
  },
  {
    id: 2,
    title: "Classic Mojito",
    price: "$4.75",
    image: menuMojito,
    category: "Drinks",
    description: "This cocktail blends minty fresh mint and white rum with a refreshing drink.",
  },
  {
    id: 3,
    title: "Coconut Drinks Fizz",
    price: "$4.25",
    image: menuCoconut,
    category: "Drinks",
    description: "A tropical delight, the Pineapple Coconut Fizz combines sweet tropical vibes with a creamy coconut.",
  },
  {
    id: 4,
    title: "Garlic Butter Shrimp",
    price: "$14.99",
    image: menuShrimp,
    category: "Non-Veg",
    description: "Succulent shrimp seared in savory garlic butter sauce served on a bed of linguine pasta.",
  },
  {
    id: 5,
    title: "Golden Bliss",
    price: "$10.00",
    image: menuDessert,
    category: "Veg",
    description: "A decadent golden creation that balances the perfect balance of flavors and textures for a truly gratifying.",
  },
  {
    id: 6,
    title: "Iced Mocha Latte",
    price: "$5.00",
    image: menuLatte,
    category: "Drinks",
    description: "A delightful mix of rich espresso, chocolate syrup, and cold milk, topped with whipped cream.",
  },
];

const MenuSection = () => {
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
            Explore Our Menu
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crave-worthy delights for every palate! Prepare to embark on a flavor-packed journey with our handpicked selection of bold and delicious food.
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="menu-card group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-accent font-bold text-lg">{item.price}</span>
                  <span className="category-tag">{item.category}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
                <button className="flex items-center gap-2 text-accent font-medium text-sm hover:gap-3 transition-all">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/menu"
            className="inline-block px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-forest-light transition-colors"
          >
            Load More
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MenuSection;
