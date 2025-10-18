import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
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

interface Product {
  id: string;
  nom: string;
  prix: number;
  images: string[];
  slug: string;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("produits")
      .select("id, nom, prix, images, slug")
      .eq("statut", "en_ligne")
      .limit(8);

    if (!error && data) {
      setProducts(data);
    }
  };

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
              <h2 className="text-3xl font-bold mb-4">Produits disponibles</h2>
              <p className="text-muted-foreground">
                Découvrez tous les produits de notre marketplace
              </p>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun produit disponible pour le moment
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    name={product.nom}
                    price={product.prix}
                    image={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                    rating={4.5}
                    reviews={0}
                    seller="Vendeur"
                  />
                ))}
              </div>
            )}
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
