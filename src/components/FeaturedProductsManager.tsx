import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  nom: string;
  prix: number;
  images: string[];
}

interface FeaturedProduct {
  id: string;
  id_produit: string;
  position: number;
  produits: Product;
}

const FeaturedProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load all online products
    const { data: productsData } = await supabase
      .from("produits")
      .select("id, nom, prix, images")
      .eq("statut", "en_ligne")
      .order("nom");

    if (productsData) {
      setProducts(productsData);
    }

    // Load featured products
    const { data: featuredData } = await supabase
      .from("produits_vedettes")
      .select(`
        id,
        id_produit,
        position,
        produits (
          id,
          nom,
          prix,
          images
        )
      `)
      .order("position");

    if (featuredData) {
      setFeaturedProducts(featuredData as any);
    }

    setLoading(false);
  };

  const addFeaturedProduct = async () => {
    if (!selectedProduct) {
      toast.error("Veuillez sélectionner un produit");
      return;
    }

    if (featuredProducts.length >= 10) {
      toast.error("Vous pouvez seulement ajouter 10 produits vedettes");
      return;
    }

    // Check if product is already featured
    if (featuredProducts.some(fp => fp.id_produit === selectedProduct)) {
      toast.error("Ce produit est déjà dans les produits vedettes");
      return;
    }

    const nextPosition = featuredProducts.length + 1;

    const { error } = await supabase
      .from("produits_vedettes")
      .insert({
        id_produit: selectedProduct,
        position: nextPosition
      });

    if (error) {
      toast.error("Erreur lors de l'ajout du produit");
      console.error(error);
    } else {
      toast.success("Produit ajouté aux vedettes");
      setSelectedProduct("");
      loadData();
    }
  };

  const removeFeaturedProduct = async (id: string, position: number) => {
    const { error: deleteError } = await supabase
      .from("produits_vedettes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    // Update positions of remaining products
    const updates = featuredProducts
      .filter(fp => fp.position > position)
      .map(fp => ({
        id: fp.id,
        position: fp.position - 1
      }));

    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from("produits_vedettes")
          .update({ position: update.position })
          .eq("id", update.id);
      }
    }

    toast.success("Produit retiré des vedettes");
    loadData();
  };

  const availableProducts = products.filter(
    p => !featuredProducts.some(fp => fp.id_produit === p.id)
  );

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produits Vedettes du Carousel</CardTitle>
        <CardDescription>
          Sélectionnez jusqu'à 10 produits à afficher dans le carousel de la page d'accueil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner un produit" />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.nom} - {product.prix} FCFA
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={addFeaturedProduct}
            disabled={featuredProducts.length >= 10}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {featuredProducts.length}/10 produits vedettes
          </p>
          
          {featuredProducts.map((fp) => (
            <div 
              key={fp.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <span className="font-semibold text-muted-foreground w-8">
                #{fp.position}
              </span>
              {fp.produits.images[0] && (
                <img 
                  src={fp.produits.images[0]} 
                  alt={fp.produits.nom}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{fp.produits.nom}</p>
                <p className="text-sm text-muted-foreground">
                  {fp.produits.prix} FCFA
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFeaturedProduct(fp.id, fp.position)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedProductsManager;
