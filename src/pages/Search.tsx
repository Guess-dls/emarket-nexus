import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon } from "lucide-react";

interface Product {
  id: string;
  nom: string;
  prix: number;
  images: string[];
  slug: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchProducts();
    } else {
      setLoading(false);
    }
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("produits")
      .select("id, nom, prix, images, slug")
      .eq("statut", "en_ligne")
      .ilike("nom", `%${query}%`)
      .limit(20);

    if (!error && data) {
      setProducts(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title={`Recherche: ${query} | Dmarket`}
        description={`Résultats de recherche pour "${query}" sur Dmarket`}
      />
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Résultats pour "{query}"
          </h1>
          <p className="text-muted-foreground">
            {loading ? "Recherche en cours..." : `${products.length} produit(s) trouvé(s)`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun produit trouvé</h2>
            <p className="text-muted-foreground">
              Essayez de modifier votre recherche ou parcourez nos catégories
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
      </main>

      <Footer />
    </div>
  );
};

export default Search;
