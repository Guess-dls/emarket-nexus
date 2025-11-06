-- Allow vendors to read orders (commandes) related to their products
CREATE POLICY "Vendors can view related orders"
ON public.commandes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.vendeur_commandes vc
    WHERE vc.id_commande = commandes.id
      AND vc.id_vendeur = auth.uid()
  )
);

-- Allow vendors to read client profiles for their related orders
CREATE POLICY "Vendors can view client profiles of their orders"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.vendeur_commandes vc
    JOIN public.commandes c ON c.id = vc.id_commande
    WHERE vc.id_vendeur = auth.uid()
      AND c.id_client = profiles.id
  )
);