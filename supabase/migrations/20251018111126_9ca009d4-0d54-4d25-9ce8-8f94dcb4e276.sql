-- Create table to link sellers to orders
CREATE TABLE IF NOT EXISTS public.vendeur_commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_vendeur UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_commande UUID NOT NULL REFERENCES public.commandes(id) ON DELETE CASCADE,
  id_produit UUID NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC NOT NULL,
  statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(id_vendeur, id_commande, id_produit)
);

-- Enable RLS
ALTER TABLE public.vendeur_commandes ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own orders
CREATE POLICY "Vendors can view their own orders"
ON public.vendeur_commandes
FOR SELECT
USING (auth.uid() = id_vendeur OR has_role(auth.uid(), 'admin'));

-- Clients can view orders related to their purchases
CREATE POLICY "Clients can view their order items"
ON public.vendeur_commandes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.commandes
    WHERE commandes.id = vendeur_commandes.id_commande
    AND commandes.id_client = auth.uid()
  )
);

-- System can insert order items
CREATE POLICY "System can insert order items"
ON public.vendeur_commandes
FOR INSERT
WITH CHECK (true);

-- Vendors can update their order items status
CREATE POLICY "Vendors can update their order items"
ON public.vendeur_commandes
FOR UPDATE
USING (auth.uid() = id_vendeur OR has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX idx_vendeur_commandes_vendeur ON public.vendeur_commandes(id_vendeur);
CREATE INDEX idx_vendeur_commandes_commande ON public.vendeur_commandes(id_commande);