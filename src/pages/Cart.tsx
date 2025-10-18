import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Cart = () => {
  const navigate = useNavigate();
  const { items, loading, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-8">
              Découvrez nos produits et commencez vos achats
            </p>
            <Button onClick={() => navigate("/")}>
              Découvrir les produits
            </Button>
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
        <h1 className="text-3xl font-bold mb-8">
          Panier ({itemCount} article{itemCount > 1 ? "s" : ""})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg border bg-card"
              >
                <img
                  src={item.produit?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                  alt={item.produit?.nom}
                  className="w-24 h-24 object-cover rounded-lg"
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
                    <span className="w-8 text-center font-medium">
                      {item.quantite}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantite + 1)}
                      disabled={item.quantite >= (item.produit?.stock || 0)}
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
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg border bg-card space-y-4">
              <h2 className="text-xl font-bold">Récapitulatif</h2>
              
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
                className="w-full"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Passer la commande
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Continuer les achats
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
