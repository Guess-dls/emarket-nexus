-- Allow pending sellers to create draft products
-- This complements the existing INSERT policy which only allows active sellers via has_role()

CREATE POLICY "Pending sellers can insert draft products"
ON public.produits
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id_vendeur
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'vendeur'::app_role
      AND ur.statut IN ('actif','en_attente')
  )
  AND statut = 'brouillon'
);
