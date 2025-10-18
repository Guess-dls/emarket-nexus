import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  id_produit: string;
  quantite: number;
  produit?: {
    nom: string;
    prix: number;
    images: string[];
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("panier")
      .select(`
        id,
        id_produit,
        quantite,
        produits:id_produit (
          nom,
          prix,
          images,
          stock
        )
      `)
      .eq("id_utilisateur", user.id);

    if (!error && data) {
      setItems(data.map(item => ({
        ...item,
        produit: Array.isArray(item.produits) ? item.produits[0] : item.produits
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (productId: string, quantity = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter au panier",
        variant: "destructive",
      });
      return;
    }

    // Check if item already in cart
    const existingItem = items.find(item => item.id_produit === productId);
    
    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantite + quantity);
      return;
    }

    const { error } = await supabase.from("panier").insert({
      id_utilisateur: user.id,
      id_produit: productId,
      quantite: quantity,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter au panier",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ajouté au panier",
      description: "Le produit a été ajouté à votre panier",
    });
    
    await loadCart();
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase.from("panier").delete().eq("id", itemId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer du panier",
        variant: "destructive",
      });
      return;
    }

    await loadCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const { error } = await supabase
      .from("panier")
      .update({ quantite: quantity })
      .eq("id", itemId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
        variant: "destructive",
      });
      return;
    }

    await loadCart();
  };

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("panier").delete().eq("id_utilisateur", user.id);
    await loadCart();
  };

  const total = items.reduce((sum, item) => {
    return sum + (item.produit?.prix || 0) * item.quantite;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
