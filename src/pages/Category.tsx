import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

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
  description: string | null;
}

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadCategoryAndProducts();
    }
  }, [slug]);

  const loadCategoryAndProducts = async () => {
    setLoading(true);
    
    // Load category info
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, nom, slug, description")
      .eq("slug", slug)
      .single();

    if (categoryError || !categoryData) {
      setLoading(false);
      return;
    }

    setCategory(categoryData);

    // Load products for this category
    const { data: productsData, error: productsError } = await supabase
      .from("produits")
      .select("id, nom, prix, images, slug")
      .eq("id_categorie", categoryData.id)
      .eq("statut", "en_ligne");

    if (!productsError && productsData) {
      setProducts(productsData);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Catégorie introuvable</h1>
            <p className="text-muted-foreground">
              Cette catégorie n'existe pas ou a été supprimée.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Category Header */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.nom}</h1>
              {category.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {category.description}
                </p>
              )}
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? 'produit trouvé' : 'produits trouvés'}
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Aucun produit disponible dans cette catégorie pour le moment
                </p>
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
      </main>

      <Footer />
    </div>
  );
};

export default Category;
