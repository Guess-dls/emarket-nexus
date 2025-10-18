-- Allow clients to insert order items when creating orders
CREATE POLICY "Clients can insert order items"
ON public.commande_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.commandes
    WHERE commandes.id = commande_items.id_commande
    AND commandes.id_client = auth.uid()
  )
);