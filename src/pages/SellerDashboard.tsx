import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart, TrendingUp, LogOut, Edit, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { AddProductDialog } from "@/components/AddProductDialog";
import { EditProductDialog } from "@/components/EditProductDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nom: string;
  prix: number;
  stock: number;
  statut: string;
  images: string[];
  created_at: string;
}

const SellerDashboard = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userRole?.role !== "vendeur")) {
      navigate("/auth");
    } else if (user) {
      loadProducts();
    }
  }, [user, userRole, loading, navigate]);

  const loadProducts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .eq("id_vendeur", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const handleEdit = (productId: string) => {
    setSelectedProduct(productId);
    setEditDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    const { error } = await supabase
      .from("produits")
      .delete()
      .eq("id", productId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
      loadProducts();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 overflow-x-hidden">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 break-words">Tableau de bord Vendeur</h1>
              <p className="text-muted-foreground">Gérez vos produits et suivez vos ventes</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          {/* Bouton principal Vendre */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <Package className="h-12 w-12 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Commencez à vendre</h2>
                  <p className="text-muted-foreground mb-4">
                    Ajoutez votre premier produit et commencez votre activité
                  </p>
                </div>
                <AddProductDialog />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Produits</CardTitle>
              <Package className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-white/80">Total de produits</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Ventes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-white/80">Commandes reçues</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 €</div>
              <p className="text-xs text-white/80">Total des revenus</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Tendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-white/80">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mes produits</CardTitle>
            <CardDescription>Gérer votre catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun produit ajouté pour le moment
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <img 
                      src={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"} 
                      alt={product.nom}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.nom}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.prix.toFixed(2)}€ • Stock: {product.stock}
                      </p>
                      <Badge variant={product.statut === "en_ligne" ? "default" : "secondary"} className="mt-1">
                        {product.statut}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(product.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedProduct && (
          <EditProductDialog
            productId={selectedProduct}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={loadProducts}
          />
        )}

      </main>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
