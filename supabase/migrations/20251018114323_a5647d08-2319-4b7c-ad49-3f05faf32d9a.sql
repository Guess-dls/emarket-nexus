-- Add DELETE policy for vendors on their own vendeur_commandes
DROP POLICY IF EXISTS "Vendors can delete their own orders" ON public.vendeur_commandes;

CREATE POLICY "Vendors can delete their own orders"
ON public.vendeur_commandes
FOR DELETE
USING (auth.uid() = id_vendeur);