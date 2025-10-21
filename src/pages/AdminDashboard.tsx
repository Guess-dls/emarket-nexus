import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Package, ShoppingCart, TrendingUp, LogOut, Settings, Ban, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  created_at: string;
  role: string;
  statut: string;
}

interface ProductData {
  id: string;
  nom: string;
  prix: number;
  stock: number;
  statut: string;
  ventes_total: number;
  created_at: string;
  vendeur_nom: string;
}

interface OrderData {
  id: string;
  total: number;
  statut: string;
  created_at: string;
  client_nom: string;
  client_email: string;
}

const AdminDashboard = () => {
  const { user, userRole, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'user' | 'product'; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || userRole?.role !== "admin")) {
      navigate("/auth");
    } else if (user && userRole?.role === "admin") {
      loadDashboardData();
    }
  }, [user, userRole, authLoading, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      loadUsers(),
      loadProducts(),
      loadOrders(),
    ]);
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        nom,
        email,
        telephone,
        created_at,
        user_roles!user_roles_user_id_fkey (
          role,
          statut
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const formattedUsers = data
        .filter((u: any) => u.user_roles && u.user_roles.length > 0)
        .map((u: any) => ({
          id: u.id,
          nom: u.nom,
          email: u.email,
          telephone: u.telephone,
          created_at: u.created_at,
          role: u.user_roles[0]?.role || "client",
          statut: u.user_roles[0]?.statut || "actif",
        }));
      setUsers(formattedUsers);
      setStats((prev) => ({ ...prev, totalUsers: formattedUsers.length }));
    }
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("produits")
      .select(`
        id,
        nom,
        prix,
        stock,
        statut,
        ventes_total,
        created_at,
        profiles!produits_id_vendeur_fkey (
          nom
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const formattedProducts = data.map((p: any) => ({
        id: p.id,
        nom: p.nom,
        prix: p.prix,
        stock: p.stock,
        statut: p.statut,
        ventes_total: p.ventes_total || 0,
        created_at: p.created_at,
        vendeur_nom: p.profiles?.nom || "Inconnu",
      }));
      setProducts(formattedProducts);
      setStats((prev) => ({ ...prev, totalProducts: formattedProducts.length }));
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("commandes")
      .select(`
        id,
        total,
        statut,
        created_at,
        profiles!commandes_id_client_fkey (
          nom,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const formattedOrders = data.map((o: any) => ({
        id: o.id,
        total: o.total,
        statut: o.statut,
        created_at: o.created_at,
        client_nom: o.profiles?.nom || "Inconnu",
        client_email: o.profiles?.email || "Inconnu",
      }));
      setOrders(formattedOrders);
      const totalRevenue = formattedOrders
        .filter((o) => o.statut === "livree")
        .reduce((sum, o) => sum + Number(o.total), 0);
      setStats((prev) => ({
        ...prev,
        totalOrders: formattedOrders.length,
        totalRevenue,
      }));
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ statut: "suspendu" })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suspendre l'utilisateur",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Utilisateur suspendu avec succès",
      });
      loadUsers();
    }
    setSuspendDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ statut: "supprime" })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Utilisateur marqué comme supprimé",
      });
      loadUsers();
    }
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteProduct = async (productId: string) => {
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
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSuspendProduct = async (productId: string) => {
    const { error } = await supabase
      .from("produits")
      .update({ statut: "suspendu" })
      .eq("id", productId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suspendre le produit",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Produit suspendu avec succès",
      });
      loadProducts();
    }
    setSuspendDialogOpen(false);
    setSelectedItem(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      actif: "default",
      en_attente: "secondary",
      suspendu: "destructive",
      supprime: "destructive",
      en_ligne: "default",
      brouillon: "secondary",
      en_cours: "default",
      livree: "default",
      annulee: "destructive",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tableau de bord Administrateur</h1>
            <p className="text-muted-foreground">Gérez la plateforme eMarket</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 text-white" style={{ background: `hsl(var(--primary))` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-white/80">Total utilisateurs</p>
            </CardContent>
          </Card>

          <Card className="border-0 text-white" style={{ background: `hsl(var(--destructive))` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Produits</CardTitle>
              <Package className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-white/80">Total produits</p>
            </CardContent>
          </Card>

          <Card className="border-0 text-white" style={{ background: `hsl(var(--accent))` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-white/80">Total commandes</p>
            </CardContent>
          </Card>

          <Card className="border-0 text-white" style={{ background: `hsl(var(--card-green))` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Revenus</CardTitle>
              <TrendingUp className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
              <p className="text-xs text-white/80">Total plateforme</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Commandes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>Liste complète des utilisateurs inscrits</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date inscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.nom}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.role}</TableCell>
                          <TableCell>{getStatusBadge(u.statut)}</TableCell>
                          <TableCell>
                            {new Date(u.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {u.statut === "actif" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem({ id: u.id, type: "user", name: u.nom });
                                    setSuspendDialogOpen(true);
                                  }}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Suspendre
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem({ id: u.id, type: "user", name: u.nom });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des produits</CardTitle>
                <CardDescription>Liste complète des produits sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Ventes</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Aucun produit trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nom}</TableCell>
                          <TableCell>{p.vendeur_nom}</TableCell>
                          <TableCell>{p.prix.toFixed(2)} €</TableCell>
                          <TableCell>{p.stock}</TableCell>
                          <TableCell>{p.ventes_total}</TableCell>
                          <TableCell>{getStatusBadge(p.statut)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {p.statut === "en_ligne" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem({ id: p.id, type: "product", name: p.nom });
                                    setSuspendDialogOpen(true);
                                  }}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Suspendre
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem({ id: p.id, type: "product", name: p.nom });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des commandes</CardTitle>
                <CardDescription>Liste complète des commandes de la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Aucune commande trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.client_nom}</TableCell>
                          <TableCell>{o.client_email}</TableCell>
                          <TableCell>{Number(o.total).toFixed(2)} €</TableCell>
                          <TableCell>{getStatusBadge(o.statut)}</TableCell>
                          <TableCell>
                            {new Date(o.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer {selectedItem?.type === "user" ? "l'utilisateur" : "le produit"} "{selectedItem?.name}" ?
                Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedItem?.type === "user") {
                    handleDeleteUser(selectedItem.id);
                  } else if (selectedItem?.type === "product") {
                    handleDeleteProduct(selectedItem.id);
                  }
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suspension</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir suspendre {selectedItem?.type === "user" ? "l'utilisateur" : "le produit"} "{selectedItem?.name}" ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedItem?.type === "user") {
                    handleSuspendUser(selectedItem.id);
                  } else if (selectedItem?.type === "product") {
                    handleSuspendProduct(selectedItem.id);
                  }
                }}
              >
                Suspendre
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
