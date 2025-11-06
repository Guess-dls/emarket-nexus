-- Fix infinite recursion by using SECURITY DEFINER helper functions

-- 1) Helper functions
CREATE OR REPLACE FUNCTION public.vendor_has_commande(_vendor uuid, _commande uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendeur_commandes
    WHERE id_vendeur = _vendor AND id_commande = _commande
  );
$$;

CREATE OR REPLACE FUNCTION public.vendor_can_view_profile(_vendor uuid, _profile uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vendeur_commandes vc
    JOIN public.commandes c ON c.id = vc.id_commande
    WHERE vc.id_vendeur = _vendor AND c.id_client = _profile
  );
$$;

-- 2) Recreate policies without cross-table references
DROP POLICY IF EXISTS "Vendors can view related orders" ON public.commandes;
CREATE POLICY "Vendors can view related orders"
ON public.commandes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR auth.uid() = id_client
  OR public.vendor_has_commande(auth.uid(), id)
);

DROP POLICY IF EXISTS "Vendors can view client profiles of their orders" ON public.profiles;
CREATE POLICY "Vendors can view client profiles of their orders"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR public.vendor_can_view_profile(auth.uid(), id)
);