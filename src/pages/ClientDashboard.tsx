import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, 
  Package, 
  Bell, 
  User, 
  LogOut, 
  ShoppingCart,
  Grid3x3,
  Trash2,
  Plus,
  Minus,
  Eye,
  Store
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";

interface Category {
  id: string;
  nom: string;
  slug: string;
  description: string;
}

interface Product {
  id: string;
  nom: string;
  prix: number;
  images: string[];
  slug: string;
  stock: number;
}

interface Order {
  id: string;
  total: number;
  statut: string;
  created_at: string;
  adresse_livraison: string;
  methode_paiement: string;
  commande_items: {
    quantite: number;
    prix_unitaire: number;
    produits: {
      nom: string;
      images: string[];
    };
  }[];
}

const ClientDashboard = () => {
  const { user, userRole, loading: authLoading, signOut } = useAuth();
  const { items, total, removeFromCart, updateQuantity, itemCount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlreadySeller, setIsAlreadySeller] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoris: 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole?.role !== "client")) {
      navigate("/auth");
    } else if (user) {
      loadDashboardData();
      checkIfSeller();
      
      // Setup realtime subscription for order updates
      const channel = supabase
        .channel('client-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'commandes',
            filter: `id_client=eq.${user.id}`,
          },
          () => {
            console.log('Order update detected, reloading...');
            loadOrders();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vendeur_commandes',
          },
          () => {
            console.log('Vendor order update detected, reloading...');
            loadOrders();
          }
        )
        .subscribe();

      // Also poll every 10 seconds
      const interval = setInterval(() => {
        loadOrders();
      }, 10000);

      return () => {
        channel.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [user, userRole, authLoading, navigate]);

  const checkIfSeller = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "vendeur")
      .maybeSingle();

    setIsAlreadySeller(!!data);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      loadCategories(),
      loadProducts(),
      loadOrders(),
    ]);
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, nom, slug, description")
      .limit(8);
    
    if (data) setCategories(data);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("produits")
      .select("id, nom, prix, images, slug, stock")
      .eq("statut", "en_ligne")
      .limit(8);
    
    if (data) setProducts(data);
  };

  const loadOrders = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("commandes")
      .select(`
        id,
        total,
        statut,
        created_at,
        adresse_livraison,
        methode_paiement,
        commande_items (
          quantite,
          prix_unitaire,
          produits:id_produit (
            nom,
            images
          )
        )
      `)
      .eq("id_client", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setOrders(data as any);
      setStats({
        totalOrders: data.length,
        totalSpent: data.reduce((sum, order) => sum + Number(order.total), 0),
        favoris: 0,
      });
    }
  };

  const deleteOrder = async (orderId: string, status: string) => {
    // Only allow deletion for pending orders
    if (status !== "en_attente") {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez supprimer que les commandes en attente",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;

    const { error } = await supabase
      .from("commandes")
      .delete()
      .eq("id", orderId)
      .eq("id_client", user!.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la commande",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Commande supprimée avec succès",
      });
      loadOrders();
    }
  };

  const cancelOrder = async (orderId: string, status: string) => {
    // Only allow cancellation for pending or in-progress orders
    if (!["en_attente", "en_cours"].includes(status)) {
      toast({
        title: "Action impossible",
        description: "Cette commande ne peut plus être annulée",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return;

    const { error } = await supabase
      .from("commandes")
      .update({ statut: "annulee" })
      .eq("id", orderId)
      .eq("id_client", user!.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Commande annulée avec succès",
      });
      loadOrders();
    }
  };

  const becomeSeller = async () => {
    if (!user) return;

    if (!confirm("Voulez-vous devenir vendeur ? Vous pourrez vendre vos produits sur DanMaket.")) return;

    const { error } = await supabase
      .from("user_roles")
      .insert({
        user_id: user.id,
        role: "vendeur",
        statut: "actif"
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de devenir vendeur. Vous êtes peut-être déjà vendeur.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Félicitations !",
        description: "Vous êtes maintenant vendeur. Rechargez la page pour accéder à votre espace vendeur.",
      });
    }
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const deleteSelectedOrders = async () => {
    if (selectedOrderIds.length === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner des commandes à supprimer",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrderIds.length} commande(s) ?`)) return;

    let successCount = 0;
    let errorCount = 0;

    for (const orderId of selectedOrderIds) {
      const { error } = await supabase
        .from("commandes")
        .delete()
        .eq("id", orderId)
        .eq("id_client", user!.id);

      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Succès",
        description: `${successCount} commande(s) supprimée(s) avec succès`,
      });
    }

    if (errorCount > 0) {
      toast({
        title: "Erreur partielle",
        description: `${errorCount} commande(s) n'ont pas pu être supprimées`,
        variant: "destructive",
      });
    }

    setSelectedOrderIds([]);
    loadOrders();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      en_attente: "secondary",
      confirmee: "default",
      en_cours: "default",
      expediee: "default",
      livree: "default",
      annulee: "destructive",
    };

    const labels: Record<string, string> = {
      en_attente: "En attente",
      confirmee: "Confirmée",
      en_cours: "En cours",
      expediee: "Expédiée",
      livree: "Livrée",
      annulee: "Annulée",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue {user?.email} - Gérez vos achats et commandes
            </p>
          </div>
          <div className="flex gap-2">
            {!isAlreadySeller && (
              <Button variant="default" onClick={becomeSeller}>
                <Store className="mr-2 h-4 w-4" />
                Devenir vendeur
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 text-white card-hover overflow-hidden relative" style={{ background: `hsl(var(--card-blue))` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-white/80">Total des commandes</p>
            </CardContent>
          </Card>

          <Card className="border-0 text-white card-hover overflow-hidden relative" style={{ background: `hsl(var(--card-green))` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
              <ShoppingBag className="h-4 w-4" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)} €</div>
              <p className="text-xs text-white/80">Total dépensé</p>
            </CardContent>
          </Card>

          <Card className="border-0 text-white card-hover overflow-hidden relative" style={{ background: `hsl(var(--card-purple))` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Panier</CardTitle>
              <ShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{itemCount}</div>
              <p className="text-xs text-white/80">{total.toFixed(2)} €</p>
            </CardContent>
          </Card>

          <Card className="border-0 text-white card-hover overflow-hidden relative" style={{ background: `hsl(var(--card-orange))` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Profil</CardTitle>
              <User className="h-4 w-4" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-sm font-medium truncate">{user?.email}</div>
              <p className="text-xs text-white/80">Client actif</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="cart">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Panier
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Bell className="h-4 w-4 mr-2" />
              Catégories
            </TabsTrigger>
          </TabsList>

          {/* Cart Tab */}
          <TabsContent value="cart">
            <Card>
              <CardHeader>
                <CardTitle>Mon panier</CardTitle>
                <CardDescription>
                  {itemCount} article{itemCount > 1 ? "s" : ""} - Total: {total.toFixed(2)} €
                </CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">Votre panier est vide</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Parcourez nos produits ci-dessous pour commencer vos achats
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 rounded-lg border"
                      >
                        <img
                          src={item.produit?.images?.[0]}
                          alt={item.produit?.nom}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate mb-1">
                            {item.produit?.nom}
                          </h3>
                          <p className="text-lg font-bold text-primary mb-2">
                            {item.produit?.prix.toFixed(2)} €
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantite - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantite}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantite + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <p className="font-bold">
                            {((item.produit?.prix || 0) * item.quantite).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Total: <span className="font-bold text-primary text-lg">{total.toFixed(2)} €</span>
                      </div>
                      <Button size="lg" asChild>
                        <Link to="/checkout">
                          Valider la commande
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mes commandes</CardTitle>
                  <CardDescription>Historique de vos commandes</CardDescription>
                </div>
                {selectedOrderIds.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={deleteSelectedOrders}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer ({selectedOrderIds.length})
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune commande pour le moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const canBeDeleted = order.statut === "annulee" || order.statut === "livree";
                      return (
                        <div
                          key={order.id}
                          className="p-4 rounded-lg border space-y-3"
                        >
                          <div className="flex justify-between items-start gap-3">
                            {canBeDeleted && (
                              <Checkbox
                                checked={selectedOrderIds.includes(order.id)}
                                onCheckedChange={() => toggleOrderSelection(order.id)}
                                className="mt-1"
                              />
                            )}
                          <div>
                            <p className="font-semibold">
                              Commande #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {getStatusBadge(order.statut)}
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.commande_items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center text-sm">
                              <img
                                src={item.produits?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                                alt={item.produits?.nom}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.produits?.nom}</p>
                                <p className="text-muted-foreground">
                                  Qté: {item.quantite} × {Number(item.prix_unitaire).toFixed(2)} €
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.commande_items && order.commande_items.length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.commande_items.length - 3} autre(s) article(s)
                            </p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              {order.commande_items?.length || 0} article(s)
                            </p>
                            <p className="font-bold text-primary text-lg">
                              {Number(order.total).toFixed(2)} €
                            </p>
                          </div>
                          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                            {order.statut === "en_attente" && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteOrder(order.id, order.statut)}
                                className="flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Supprimer</span>
                              </Button>
                            )}
                            {(order.statut === "en_attente" || order.statut === "en_cours") && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => cancelOrder(order.id, order.statut)}
                                className="flex-shrink-0"
                              >
                                <span>Annuler</span>
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedOrder(order);
                                setOrderDetailOpen(true);
                              }}
                              className="flex-shrink-0"
                            >
                              <Eye className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Détails</span>
                            </Button>
                          </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Produits disponibles</CardTitle>
                <CardDescription>Découvrez nos derniers produits</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun produit disponible
                  </div>
                ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.nom}
                        price={product.prix}
                        image={product.images[0]}
                        rating={4.5}
                        reviews={0}
                        seller="Dmarket"
                      />
                    ))}
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {products.length} produit{products.length > 1 ? "s" : ""} affiché{products.length > 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Catégories</CardTitle>
                <CardDescription>Parcourez par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune catégorie disponible
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="p-6 rounded-lg border bg-card hover:bg-accent hover:shadow-lg transition-all group card-hover"
                      >
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {category.nom}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Détails de la commande</DialogTitle>
                <DialogDescription>
                  Commande #{selectedOrder.id.slice(0, 8)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Order Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="font-semibold">{getStatusBadge(selectedOrder.statut)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Products List */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Articles commandés</h4>
                  {selectedOrder.commande_items?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <img
                        src={item.produits?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                        alt={item.produits?.nom}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.produits?.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantite} × {Number(item.prix_unitaire).toFixed(2)} € = {(item.quantite * Number(item.prix_unitaire)).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Info */}
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold">Informations de livraison</h4>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Adresse:</span>{" "}
                    {selectedOrder.adresse_livraison}
                  </p>
                  {selectedOrder.methode_paiement && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Mode de paiement:</span>{" "}
                      {selectedOrder.methode_paiement}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total de la commande</span>
                    <span className="text-2xl font-bold text-primary">
                      {Number(selectedOrder.total).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selectedOrder.statut === "en_attente" && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteOrder(selectedOrder.id, selectedOrder.statut);
                          setOrderDetailOpen(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          cancelOrder(selectedOrder.id, selectedOrder.statut);
                          setOrderDetailOpen(false);
                        }}
                      >
                        Annuler
                      </Button>
                    </>
                  )}
                  {selectedOrder.statut === "en_cours" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        cancelOrder(selectedOrder.id, selectedOrder.statut);
                        setOrderDetailOpen(false);
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
