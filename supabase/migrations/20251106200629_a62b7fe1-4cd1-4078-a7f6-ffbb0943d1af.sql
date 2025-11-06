-- Drop the conflicting policies I just added
DROP POLICY IF EXISTS "Vendors can view related orders" ON public.commandes;
DROP POLICY IF EXISTS "Vendors can view client profiles of their orders" ON public.profiles;

-- Recreate them with proper logic that doesn't conflict with admin access
CREATE POLICY "Vendors can view related orders"
ON public.commandes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1
    FROM public.vendeur_commandes vc
    WHERE vc.id_commande = commandes.id
      AND vc.id_vendeur = auth.uid()
  )
);

CREATE POLICY "Vendors can view client profiles of their orders"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1
    FROM public.vendeur_commandes vc
    JOIN public.commandes c ON c.id = vc.id_commande
    WHERE vc.id_vendeur = auth.uid()
      AND c.id_client = profiles.id
  )
);

-- Ensure admin has full UPDATE and DELETE on commandes
DROP POLICY IF EXISTS "Admins can update orders" ON public.commandes;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.commandes;

CREATE POLICY "Admins can update orders"
ON public.commandes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete orders"
ON public.commandes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert orders"
ON public.commandes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ensure admin has UPDATE on profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ensure admin has full control on commande_items
DROP POLICY IF EXISTS "Admins can manage order items" ON public.commande_items;
CREATE POLICY "Admins can manage order items"
ON public.commande_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ensure admin has DELETE on vendeur_commandes
DROP POLICY IF EXISTS "Admins can delete vendor orders" ON public.vendeur_commandes;
CREATE POLICY "Admins can delete vendor orders"
ON public.vendeur_commandes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));