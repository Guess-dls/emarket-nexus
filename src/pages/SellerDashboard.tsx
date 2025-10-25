import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, DollarSign, ShoppingCart, TrendingUp, LogOut, Edit, Trash2, Eye, Grid3x3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
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
  ventes_total: number;
}

interface AllProduct {
  id: string;
  nom: string;
  prix: number;
  images: string[];
  slug: string;
}

interface VendorOrder {
  id: string;
  id_commande: string;
  quantite: number;
  prix_unitaire: number;
  statut: string;
  created_at: string;
  produits: {
    nom: string;
    images: string[];
  };
  commandes: {
    id: string;
    adresse_livraison: string;
    profiles: {
      nom: string;
      email: string;
    };
  };
}

const SellerDashboard = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<AllProduct[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalSales: 0,
  });

  useEffect(() => {
    if (!loading && (!user || userRole?.role !== "vendeur")) {
      navigate("/auth");
    } else if (user) {
      loadDashboardData();

      // Setup realtime subscription for order updates
      const channel = supabase
        .channel('vendor-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vendeur_commandes',
            filter: `id_vendeur=eq.${user.id}`,
          },
          () => {
            console.log('Vendor order update detected, reloading...');
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, userRole, loading, navigate]);

  const loadDashboardData = async () => {
    await Promise.all([
      loadProducts(),
      loadOrders(),
      loadAllProducts(),
    ]);
  };

  const loadProducts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .eq("id_vendeur", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
      const totalSales = data.reduce((sum, p) => sum + (p.ventes_total || 0), 0);
      setStats(prev => ({ ...prev, totalProducts: data.length, totalSales }));
    }
  };

  const loadAllProducts = async () => {
    const { data, error } = await supabase
      .from("produits")
      .select("id, nom, prix, images, slug")
      .eq("statut", "en_ligne")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAllProducts(data);
    }
  };

  const loadOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("vendeur_commandes")
      .select(`
        id,
        id_commande,
        quantite,
        prix_unitaire,
        statut,
        created_at,
        produits:id_produit (
          nom,
          images
        ),
        commandes:id_commande (
          id,
          adresse_livraison,
          id_client
        )
      `)
      .eq("id_vendeur", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    console.log("Vendor orders query:", { data, error, userId: user.id });

    if (!error && data) {
      // Fetch client info separately for each order
      const ordersWithClients = await Promise.all(
        data.map(async (order: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("nom, email")
            .eq("id", order.commandes?.id_client)
            .single();
          
          return {
            ...order,
            commandes: {
              ...order.commandes,
              profiles: profile
            }
          };
        })
      );

      setOrders(ordersWithClients as any);
      const totalRevenue = data.reduce((sum, order) => 
        sum + (Number(order.prix_unitaire) * order.quantite), 0
      );
      setStats(prev => ({ ...prev, totalOrders: data.length, totalRevenue }));
    } else if (error) {
      console.error("Error loading vendor orders:", error);
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log('Updating order status:', { orderId, newStatus });
    
    const { error } = await supabase
      .from("vendeur_commandes")
      .update({ statut: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error('Update status error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Statut mis à jour",
      });
      loadOrders();
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;

    const { error } = await supabase
      .from("vendeur_commandes")
      .delete()
      .eq("id", orderId);

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

  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      en_attente: "secondary",
      en_cours: "default",
      expediee: "default",
      livree: "default",
      annulee: "destructive",
    };

    const labels: Record<string, string> = {
      en_attente: "En attente",
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
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tableau de bord Vendeur</h1>
              <p className="text-muted-foreground">
                Gérez vos produits et suivez vos ventes
              </p>
            </div>
            <div className="flex gap-2">
              <AddProductDialog />
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-white/80">{stats.totalSales} ventes</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-white/80">Commandes reçues</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
              <p className="text-xs text-white/80">Total des revenus</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendance</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalOrders > 0 ? "↗" : "→"}
              </div>
              <p className="text-xs text-white/80">Performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Mes Produits
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="catalog">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Catalogue
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Mes produits</CardTitle>
                <CardDescription>Gérer votre catalogue</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Aucun produit pour le moment
                    </p>
                    <AddProductDialog />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"} 
                          alt={product.nom}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{product.nom}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.prix.toFixed(2)}€ • Stock: {product.stock} • Ventes: {product.ventes_total || 0}
                          </p>
                          {getStatusBadge(product.statut)}
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
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Mes commandes</CardTitle>
                <CardDescription>Gérer les commandes de vos produits</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune commande pour le moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-lg border space-y-3"
                      >
                        <div className="flex gap-4">
                          <img
                            src={order.produits?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                            alt={order.produits?.nom}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">{order.produits?.nom}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Commande #{order.id_commande.slice(0, 8)}
                                </p>
                              </div>
                              {getStatusBadge(order.statut)}
                            </div>

                            <div className="text-sm space-y-1">
                              <p>
                                <span className="text-muted-foreground">Client:</span>{" "}
                                {order.commandes?.profiles?.nom || order.commandes?.profiles?.email}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Quantité:</span>{" "}
                                {order.quantite}
                              </p>
                              <p className="font-bold text-primary">
                                Total: {(Number(order.prix_unitaire) * order.quantite).toFixed(2)} €
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          {order.statut === "en_attente" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "en_cours")}
                              >
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </Button>
                            </>
                          )}
                          {order.statut === "en_cours" && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "expediee")}
                            >
                              Marquer comme expédiée
                            </Button>
                          )}
                          {order.statut === "expediee" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "livree")}
                            >
                              Marquer comme livrée
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Catalog Tab */}
          <TabsContent value="catalog">
            <Card>
              <CardHeader>
                <CardTitle>Catalogue complet</CardTitle>
                <CardDescription>Tous les produits disponibles sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                {allProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun produit disponible
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {allProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.nom}
                        price={product.prix}
                        image={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                        rating={4.5}
                        reviews={0}
                        seller="Lovable"
                      />
                    ))}
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {allProducts.length} produit{allProducts.length > 1 ? "s" : ""} disponible{allProducts.length > 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedProduct && (
          <EditProductDialog
            productId={selectedProduct}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={loadProducts}
          />
        )}

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails de la commande</DialogTitle>
                <DialogDescription>
                  Commande #{selectedOrder.id_commande.slice(0, 8)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Product Info */}
                <div className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={selectedOrder.produits?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                    alt={selectedOrder.produits?.nom}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedOrder.produits?.nom}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Prix unitaire:</span>{" "}
                        <span className="font-bold">{Number(selectedOrder.prix_unitaire).toFixed(2)} €</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Quantité:</span>{" "}
                        <span className="font-bold">{selectedOrder.quantite}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Total:</span>{" "}
                        <span className="font-bold text-primary text-lg">
                          {(Number(selectedOrder.prix_unitaire) * selectedOrder.quantite).toFixed(2)} €
                        </span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(selectedOrder.statut)}
                </div>

                {/* Customer Info */}
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold">Informations client</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Nom:</span>{" "}
                      {selectedOrder.commandes?.profiles?.nom || "N/A"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {selectedOrder.commandes?.profiles?.email || "N/A"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Adresse de livraison:</span>{" "}
                      {selectedOrder.commandes?.adresse_livraison || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold">Informations de commande</h4>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selectedOrder.statut === "en_attente" && (
                    <>
                      <Button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, "en_cours");
                          setOrderDetailOpen(false);
                        }}
                      >
                        Accepter la commande
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteOrder(selectedOrder.id);
                          setOrderDetailOpen(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </>
                  )}
                  {selectedOrder.statut === "en_cours" && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "expediee");
                        setOrderDetailOpen(false);
                      }}
                    >
                      Marquer comme expédiée
                    </Button>
                  )}
                  {selectedOrder.statut === "expediee" && (
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "livree");
                        setOrderDetailOpen(false);
                      }}
                    >
                      Marquer comme livrée
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

export default SellerDashboard;
