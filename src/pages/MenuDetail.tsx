import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import menuMojito from "@/assets/menu-mojito.jpg";
import menuCoconut from "@/assets/menu-coconut.jpg";
import menuShrimp from "@/assets/menu-shrimp.jpg";
import menuDessert from "@/assets/menu-dessert.jpg";
import menuLatte from "@/assets/menu-latte.jpg";
import heroFood from "@/assets/hero-food.jpg";

const allMenuItems = [
  {
    id: "1",
    title: "BBQ Grilled Ribs",
    price: "$18.99",
    image: heroFood,
    category: "Non-Veg",
    description: "To die-for meat recipe for ribs, our BBQ ribs! Ribs are glazed with a savory-sweet barbecue sauce that caramelizes beautifully on the grill.",
    longDescription: `Indulge in our **Iced Mocha Latte**, a delicious blend of rich espresso, creamy chocolate syrup, and cold milk, topped with generous whipped cream. This irresistible beverage combines the bold flavor of coffee with the sweetness of chocolate for an invigorating treat.

With the bold flavors of espresso complemented by the smooth chocolate notes, the Iced Mocha Latte is more than just a drink—it's a perfect balance of taste and texture. All of your senses are alive with this beverage that's as tasty to drink as it is to look at.`,
    overview: "Our Iced Mocha Latte contains the robust taste of espresso, the decadence of chocolate syrup, and the creaminess of cold milk.",
    ingredients: ["Rich espresso", "Chocolate syrup", "Cold milk", "Whipped cream", "Chocolate drizzle"],
  },
  {
    id: "2",
    title: "Classic Mojito",
    price: "$4.75",
    image: menuMojito,
    category: "Drinks",
    description: "This cocktail blends minty fresh mint and white rum with a refreshing drink.",
    longDescription: "A classic Cuban cocktail that's perfect for any occasion.",
    overview: "Fresh mint, lime juice, white rum, sugar, and soda water.",
    ingredients: ["Fresh mint leaves", "White rum", "Lime juice", "Sugar", "Soda water"],
  },
  {
    id: "3",
    title: "Coconut Drinks Fizz",
    price: "$4.25",
    image: menuCoconut,
    category: "Drinks",
    description: "A tropical delight combining sweet tropical vibes with creamy coconut.",
    longDescription: "Escape to paradise with our refreshing coconut fizz.",
    overview: "Coconut cream, pineapple juice, and sparkling water.",
    ingredients: ["Coconut cream", "Pineapple juice", "Sparkling water", "Orange garnish"],
  },
  {
    id: "4",
    title: "Garlic Butter Shrimp",
    price: "$14.99",
    image: menuShrimp,
    category: "Non-Veg",
    description: "Succulent shrimp seared in savory garlic butter sauce.",
    longDescription: "Our signature shrimp dish that's loved by everyone.",
    overview: "Fresh shrimp seared to perfection in garlic butter.",
    ingredients: ["Fresh shrimp", "Garlic", "Butter", "Parsley", "Lemon"],
  },
  {
    id: "5",
    title: "Golden Bliss",
    price: "$10.00",
    image: menuDessert,
    category: "Veg",
    description: "A decadent golden creation with perfect balance of flavors.",
    longDescription: "Our signature dessert that melts in your mouth.",
    overview: "Caramel flan with gold leaf decoration.",
    ingredients: ["Eggs", "Cream", "Caramel", "Vanilla", "Gold leaf"],
  },
  {
    id: "6",
    title: "Iced Mocha Latte",
    price: "$5.00",
    image: menuLatte,
    category: "Drinks",
    description: "A delightful mix of rich espresso and chocolate.",
    longDescription: "The perfect pick-me-up for any time of day.",
    overview: "Rich espresso with chocolate and cold milk.",
    ingredients: ["Espresso", "Chocolate syrup", "Cold milk", "Whipped cream"],
  },
];

const MenuDetail = () => {
  const { id } = useParams();
  const item = allMenuItems.find((m) => m.id === id);

  if (!item) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-4xl font-serif font-bold text-primary">Item Not Found</h1>
          <Link to="/menu" className="btn-orange inline-block mt-8">
            Back to Menu
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedItems = allMenuItems.filter((m) => m.id !== id).slice(0, 3);

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
            {item.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-primary-foreground/70 max-w-2xl mx-auto"
          >
            {item.description}
          </motion.p>
        </div>
      </section>

      {/* Main Image */}
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
                src={item.image}
                alt={item.title}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">
                {item.title}:
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {item.longDescription}
              </p>

              <h3 className="text-2xl font-serif font-bold text-primary mb-4">
                {item.title} Overview:
              </h3>
              <p className="text-muted-foreground mb-8">
                {item.overview}
              </p>

              <h3 className="text-2xl font-serif font-bold text-primary mb-4">
                Key Ingredients:
              </h3>
              <ul className="list-disc list-inside text-muted-foreground mb-8 space-y-2">
                {item.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-accent">{item.price}</span>
                <button className="btn-orange flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Items */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-primary text-center mb-12">
            Explore Our Menu
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedItems.map((relItem, index) => (
              <motion.div
                key={relItem.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="menu-card group"
              >
                <Link to={`/menu/${relItem.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={relItem.image}
                      alt={relItem.title}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="text-accent font-bold text-lg">{relItem.price}</span>
                      <span className="category-tag">{relItem.category}</span>
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <Link to={`/menu/${relItem.id}`}>
                    <h3 className="text-xl font-serif font-bold text-primary mb-2 hover:text-accent transition-colors">
                      {relItem.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {relItem.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MenuDetail;
