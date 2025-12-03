import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Mail, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  [key: string]: any;
}

const AdminSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [usersResults, setUsersResults] = useState<SearchResult[]>([]);
  const [productsResults, setProductsResults] = useState<SearchResult[]>([]);
  const [ordersResults, setOrdersResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ email: string; nom: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un terme de recherche",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const query = searchQuery.toLowerCase();

    try {
      // Search users
      const { data: users } = await supabase
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
        .or(`nom.ilike.%${query}%,email.ilike.%${query}%,telephone.ilike.%${query}%`);

      setUsersResults(users || []);

      // Search products
      const { data: products } = await supabase
        .from("produits")
        .select(`
          id,
          nom,
          prix,
          stock,
          statut,
          created_at,
          profiles!produits_id_vendeur_fkey (
            nom,
            email
          )
        `)
        .or(`nom.ilike.%${query}%,description.ilike.%${query}%`);

      setProductsResults(products || []);

      // Search orders
      const { data: orders } = await supabase
        .from("commandes")
        .select(`
          id,
          total,
          statut,
          created_at,
          adresse_livraison,
          profiles!commandes_id_client_fkey (
            nom,
            email
          )
        `)
        .or(`adresse_livraison.ilike.%${query}%,statut.ilike.%${query}%`);

      setOrdersResults(orders || []);

      toast({
        title: "Recherche terminée",
        description: `${(users?.length || 0) + (products?.length || 0) + (orders?.length || 0)} résultats trouvés`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Search error:", error);
      }
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedRecipient || !emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-admin-email", {
        body: {
          to: selectedRecipient.email,
          recipientName: selectedRecipient.nom,
          subject: emailSubject,
          message: emailMessage,
        },
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: `Email envoyé avec succès à ${selectedRecipient.nom}`,
      });
      
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailMessage("");
      setSelectedRecipient(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Email error:", error);
      }
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de l'email",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const openEmailDialog = (email: string, nom: string) => {
    setSelectedRecipient({ email, nom });
    setEmailDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recherche dans la base de données</CardTitle>
        <CardDescription>
          Recherchez des utilisateurs, produits ou commandes et envoyez des emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              Utilisateurs ({usersResults.length})
            </TabsTrigger>
            <TabsTrigger value="products">
              Produits ({productsResults.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              Commandes ({ordersResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Aucun résultat
                    </TableCell>
                  </TableRow>
                ) : (
                  usersResults.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.nom}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telephone || "N/A"}</TableCell>
                      <TableCell>
                        <Badge>{user.user_roles?.[0]?.role || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEmailDialog(user.email, user.nom)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Envoyer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="products">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Vendeur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucun résultat
                    </TableCell>
                  </TableRow>
                ) : (
                  productsResults.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.nom}</TableCell>
                      <TableCell>{product.prix} FCFA</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge>{product.statut}</Badge>
                      </TableCell>
                      <TableCell>{product.profiles?.nom || "N/A"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openEmailDialog(
                              product.profiles?.email,
                              product.profiles?.nom
                            )
                          }
                          disabled={!product.profiles?.email}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Vendeur
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="orders">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucun résultat
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersResults.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{order.profiles?.nom || "N/A"}</TableCell>
                      <TableCell>{order.total} FCFA</TableCell>
                      <TableCell>
                        <Badge>{order.statut}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openEmailDialog(
                              order.profiles?.email,
                              order.profiles?.nom
                            )
                          }
                          disabled={!order.profiles?.email}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Client
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Envoyer un email</DialogTitle>
              <DialogDescription>
                Envoyer un email à {selectedRecipient?.nom} ({selectedRecipient?.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Sujet de l'email"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Votre message..."
                  rows={6}
                />
              </div>
              <Button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="w-full"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer l'email
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminSearch;
