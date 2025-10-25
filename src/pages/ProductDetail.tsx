import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  images: string[];
  id_vendeur: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    
    if (user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      isAdmin = !!roleData;
    }

    // Build query - admins can see all products, others only see "en_ligne"
    let query = supabase
      .from("produits")
      .select("*")
      .eq("id", id);
    
    if (!isAdmin) {
      query = query.eq("statut", "en_ligne");
    }

    const { data, error } = await query.single();

    if (error || !data) {
      toast({
        title: "Erreur",
        description: "Produit introuvable",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (quantity > product.stock) {
      toast({
        title: "Stock insuffisant",
        description: `Seulement ${product.stock} disponible(s)`,
        variant: "destructive",
      });
      return;
    }

    await addToCart(product.id, quantity);
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive",
      });
      return;
    }

    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={product.images[selectedImage] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.nom}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span>4.5</span>
                </div>
                <span>•</span>
                <span>Vendu par Lovable</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              {product.prix.toFixed(2)} €
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Stock:</span>
                <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                  {product.stock > 0 ? `${product.stock} disponible(s)` : "Rupture de stock"}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="font-medium">Quantité:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au panier
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
