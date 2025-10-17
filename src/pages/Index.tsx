import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { 
  Smartphone, 
  Laptop, 
  Watch, 
  Headphones, 
  Camera, 
  Gamepad,
  Shirt,
  Home as HomeIcon
} from "lucide-react";

const Index = () => {
  const categories = [
    { name: "Électronique", icon: Smartphone, productCount: 1250, slug: "electronique" },
    { name: "Ordinateurs", icon: Laptop, productCount: 830, slug: "ordinateurs" },
    { name: "Montres", icon: Watch, productCount: 420, slug: "montres" },
    { name: "Audio", icon: Headphones, productCount: 680, slug: "audio" },
    { name: "Photo", icon: Camera, productCount: 320, slug: "photo" },
    { name: "Gaming", icon: Gamepad, productCount: 560, slug: "gaming" },
    { name: "Mode", icon: Shirt, productCount: 2100, slug: "mode" },
    { name: "Maison", icon: HomeIcon, productCount: 1400, slug: "maison" },
  ];

  const featuredProducts = [
    {
      id: "1",
      name: "Smartphone Premium X Pro",
      price: 899.99,
      originalPrice: 1099.99,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      rating: 4.8,
      reviews: 234,
      seller: "TechStore",
      badge: "Nouveauté",
    },
    {
      id: "2",
      name: "Montre Connectée Elite",
      price: 349.99,
      originalPrice: 449.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      rating: 4.6,
      reviews: 189,
      seller: "GadgetPro",
    },
    {
      id: "3",
      name: "Écouteurs Sans Fil Premium",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      rating: 4.9,
      reviews: 456,
      seller: "AudioMax",
      badge: "Best Seller",
    },
    {
      id: "4",
      name: "Ordinateur Portable Gaming",
      price: 1499.99,
      originalPrice: 1799.99,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
      rating: 4.7,
      reviews: 178,
      seller: "GamerZone",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />

        {/* Categories Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Parcourir par catégorie</h2>
              <p className="text-muted-foreground">
                Découvrez nos catégories populaires
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.slug} {...category} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Produits en vedette</h2>
              <p className="text-muted-foreground">
                Les meilleurs produits sélectionnés pour vous
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à vendre vos produits ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de vendeurs qui font confiance à eMarket pour développer leur activité en ligne.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Commencer à vendre
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
