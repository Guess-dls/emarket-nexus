import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import BannerCarousel from "@/components/BannerCarousel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
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

interface Category {
  id: string;
  nom: string;
  slug: string;
  productCount?: number;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoryIcons: Record<string, any> = {
    electronique: Smartphone,
    ordinateurs: Laptop,
    montres: Watch,
    audio: Headphones,
    photo: Camera,
    gaming: Gamepad,
    mode: Shirt,
    maison: HomeIcon,
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data: categoriesData, error } = await supabase
      .from("categories")
      .select("id, nom, slug");

    if (!error && categoriesData) {
      // Count products for each category
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (cat) => {
          const { count } = await supabase
            .from("produits")
            .select("*", { count: "exact", head: true })
            .eq("id_categorie", cat.id)
            .eq("statut", "en_ligne");
          
          return { ...cat, productCount: count || 0 };
        })
      );
      
      setCategories(categoriesWithCount);
    }
  };

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
      <SEO 
        title="Dmarket - Achetez les meilleurs produits en Afrique"
        description="Explorez les produits les plus tendances sur Dmarket. Livraison rapide, paiement sécurisé."
        url="https://dmarket.com/"
      />
      <Navbar />
      
      <main className="flex-1">
        <Hero />

        {/* Banner Carousel for promotions */}
        <section className="py-8">
          <div className="container">
            <BannerCarousel />
          </div>
        </section>

        {/* Featured Products Carousel */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Produits en vedette</h2>
              <p className="text-muted-foreground">
                Découvrez notre sélection de produits exceptionnels
              </p>
            </div>
            <FeaturedCarousel />
          </div>
        </section>

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
                <CategoryCard 
                  key={category.slug} 
                  name={category.nom}
                  icon={categoryIcons[category.slug] || Smartphone}
                  productCount={category.productCount || 0}
                  slug={category.slug}
                />
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
              <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
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
        <section className="py-16 bg-muted/30">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à vendre vos produits ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de vendeurs qui font confiance à Dmarket pour développer leur activité en ligne.
            </p>
            <Button 
              size="lg"
              className="bg-primary hover:opacity-90 transition-opacity"
              asChild
            >
              <Link to="/auth">
                Commencer à vendre
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
