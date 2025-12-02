-- Allow clients to become sellers via a secure function instead of direct inserts
CREATE OR REPLACE FUNCTION public.become_seller()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Do nothing if the user is already a seller (any statut)
  IF EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'vendeur'
  ) THEN
    RETURN;
  END IF;

  -- Insert seller role as active for the current user
  INSERT INTO public.user_roles (user_id, role, statut)
  VALUES (auth.uid(), 'vendeur', 'actif');
END;
$$;