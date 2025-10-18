import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Truck } from "lucide-react";
import { useForm } from "react-hook-form";

interface CheckoutForm {
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  methodePaiement: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const adresseComplete = `${data.adresse}, ${data.ville}`;

      // Create order
      const { data: commande, error: commandeError } = await supabase
        .from("commandes")
        .insert({
          id_client: user.id,
          total: total,
          adresse_livraison: adresseComplete,
          methode_paiement: data.methodePaiement,
          statut: "en_attente",
        })
        .select()
        .single();

      if (commandeError) {
        console.error("Order creation error:", commandeError);
        throw new Error("Erreur lors de la création de la commande");
      }

      // Create order items (trigger handles stock and vendor links)
      const orderItems = items.map(item => ({
        id_commande: commande.id,
        id_produit: item.id_produit,
        quantite: item.quantite,
        prix_unitaire: item.produit?.prix || 0,
      }));

      const { error: itemsError } = await supabase
        .from("commande_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
        throw new Error("Erreur lors de l'ajout des articles");
      }

      await clearCart();

      toast({
        title: "Commande validée !",
        description: "Votre commande a été enregistrée avec succès",
      });

      navigate("/client-dashboard");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Info */}
              <div className="p-6 rounded-lg border bg-card space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Adresse de livraison</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom">Nom complet *</Label>
                    <Input
                      id="nom"
                      {...register("nom", { required: "Nom requis" })}
                      className={errors.nom ? "border-destructive" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      {...register("telephone", { required: "Téléphone requis" })}
                      className={errors.telephone ? "border-destructive" : ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email requis" })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="adresse">Adresse *</Label>
                  <Textarea
                    id="adresse"
                    {...register("adresse", { required: "Adresse requise" })}
                    className={errors.adresse ? "border-destructive" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    {...register("ville", { required: "Ville requise" })}
                    className={errors.ville ? "border-destructive" : ""}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-6 rounded-lg border bg-card space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Mode de paiement</h2>
                </div>

                <RadioGroup defaultValue="card" {...register("methodePaiement")}>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      Carte bancaire
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      PayPal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      Paiement à la livraison
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-lg border bg-card space-y-4">
                <h2 className="text-xl font-bold">Récapitulatif</h2>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2">
                        {item.produit?.nom} × {item.quantite}
                      </span>
                      <span className="font-medium">
                        {((item.produit?.prix || 0) * item.quantite).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4 border-y">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{total.toFixed(2)} €</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Traitement..." : "Valider la commande"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
